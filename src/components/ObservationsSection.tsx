import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-hot-toast';
import { supabase } from '../services/supabaseClient';

export interface Observation {
  id: string;
  file?: File;
  fileType?: string;
  fileUrl?: string; // Puede ser una URL firmada
  pathRel?: string; // Ruta relativa en storage
  note: string;
  uploading?: boolean;
  deleted?: boolean;
  updated?: boolean;
}

// Componente para renderizar imagen/video/link con firma si es necesario
const RenderSignedMedia: React.FC<{ fileUrl?: string; pathRel?: string; fileType?: string }> = ({ fileUrl, pathRel, fileType }) => {
  const [signedUrl, setSignedUrl] = React.useState<string | undefined>(fileUrl);

  React.useEffect(() => {
    let mounted = true;
    const signUrl = async () => {
      if (!fileUrl && pathRel) {
        const { data, error } = await supabase.storage.from('reports').createSignedUrl(pathRel, 60 * 60);
        if (!error && data?.signedUrl && mounted) {
          setSignedUrl(data.signedUrl);
        }
      }
    };
    signUrl();
    return () => { mounted = false; };
  }, [fileUrl, pathRel]);

  if (!signedUrl) return <span className="text-xs text-gray-400">Archivo no disponible</span>;
  if (fileType?.startsWith('image')) {
    return <img src={signedUrl} alt="Observación" className="w-24 h-24 object-cover rounded mt-2" />;
  }
  if (fileType?.startsWith('video')) {
    return <video src={signedUrl} controls className="w-24 h-24 mt-2" />;
  }
  return <a href={signedUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-blue-600 underline mt-2">Ver archivo</a>;
};

interface ObservationsSectionProps {
  reportId?: string;
  initialObservations?: Observation[];
  onObservationsChange?: (obs: Observation[]) => void;
  disabled?: boolean;
}

const BUCKET = 'reports';
const FOLDER = 'observations';

const ObservationsSection: React.FC<ObservationsSectionProps> = ({
  reportId,
  initialObservations = [],
  onObservationsChange,
  disabled = false,
}) => {
  const [modalMedia, setModalMedia] = useState<{ url: string; pathRel?: string; type: 'image' | 'video' } | undefined>(undefined);
  const [observations, setObservations] = useState<Observation[]>(initialObservations);
  const [savingObs, setSavingObs] = useState<string | null>(null); // id de la obs que se está guardando

  const handleUpdateObservation = async (obsId: string | number) => {
    const obs = observations.find(o => o.id === obsId || o.id === obsId.toString());
    if (!obs || !reportId) return;
    setSavingObs(obsId.toString());
    try {
      let filePath = obs.pathRel;
      let fileType = obs.fileType;
      // Si hay archivo nuevo, subir y actualizar path/file_type
      if (obs.file) {
        const ext = obs.file.name.split('.').pop();
        const uuid = uuidv4();
        filePath = `observations/${reportId}/${uuid}.${ext}`;
        const { error: uploadError } = await supabase.storage.from('reports').upload(filePath, obs.file);
        if (uploadError) throw new Error('Error subiendo archivo: ' + uploadError.message);
        fileType = obs.file.type;
      }
      // Actualizar en BD
      const { error: updateError } = await supabase.from('report_observations').update({
        note: obs.note,
        ...(filePath ? { path: filePath } : {}),
        ...(fileType ? { file_type: fileType } : {}),
      }).eq('id', obsId);
      if (updateError) throw new Error('Error actualizando observación: ' + updateError.message);
      // Si se actualizó archivo, obtener nueva URL firmada
      let newFileUrl = obs.fileUrl;
      if (filePath) {
        const { data: signed, error: signErr } = await supabase.storage.from('reports').createSignedUrl(filePath, 60 * 60);
        if (!signErr && signed?.signedUrl) newFileUrl = signed.signedUrl;
      }
      setObservations(prev => prev.map(o =>
        (o.id === obsId || o.id === obsId.toString())
          ? {
              ...o,
              file: undefined,
              fileUrl: newFileUrl || '',
              pathRel: filePath,
              fileType,
              uploading: false,
            }
          : o
      ));
      toast.success('Observación actualizada');
    } catch (err: any) {
      toast.error(err?.message || 'Error actualizando observación');
    } finally {
      setSavingObs(null);
    }
  };

  const handleSaveObservation = async (obsId: string) => {
    const obs = observations.find(o => o.id === obsId);
    if (!obs || !reportId) return;
    if (!obs.file || !obs.note) {
      toast.error('Agrega archivo y nota');
      return;
    }
    setSavingObs(obsId);
    try {
      // 1. Subir archivo
      const ext = obs.file.name.split('.').pop();
      const uuid = uuidv4();
      const filePath = `observations/${reportId}/${uuid}.${ext}`;
      const { error: uploadError } = await supabase.storage.from('reports').upload(filePath, obs.file);
      if (uploadError) throw new Error('Error subiendo archivo: ' + uploadError.message);
      // 2. Insertar en BD
      const { data: insertData, error: insertError } = await supabase.from('report_observations').insert({
        report_id: reportId,
        file_type: obs.file.type,
        path: filePath,
        note: obs.note,
      }).select('*').single();
      if (insertError) throw new Error('Error guardando observación: ' + insertError.message);
      // 3. Actualizar estado local: reemplazar obs local por obs guardada
      setObservations(prev => prev.map(o =>
        o.id === obsId
          ? {
              ...o,
              id: insertData.id,
              file: undefined,
              fileUrl: '',
              pathRel: insertData.path,
              fileType: insertData.file_type,
              note: insertData.note,
              uploading: false,
            }
          : o
      ));
      toast.success('Observación guardada');
    } catch (err: any) {
      toast.error(err?.message || 'Error guardando observación');
    } finally {
      setSavingObs(null);
    }
  };


  // Sincroniza el estado interno solo si las observaciones iniciales realmente cambiaron (para evitar bucles infinitos)
  React.useEffect(() => {
    // Compara shallow, suficiente para este caso
    if (
      initialObservations.length !== observations.length ||
      initialObservations.some((obs, i) => obs.id !== observations[i]?.id)
    ) {
      setObservations(initialObservations);
    }
  }, [initialObservations]);

  // Notifica cambios al padre cada vez que cambian las observaciones
  React.useEffect(() => {
    onObservationsChange && onObservationsChange(observations);
  }, [observations, onObservationsChange]);

  const handleAdd = () => {
    setObservations([
      ...observations,
      { id: uuidv4(), note: '', file: undefined, fileType: undefined },
    ]);
  };

  const handleRemove = async (id: string) => {
    const obs = observations.find(o => o.id === id);
    if (!obs) return;
    // Confirmación antes de eliminar
    const confirm = window.confirm('¿Estás seguro de que deseas eliminar esta observación? Esta acción no se puede deshacer.');
    if (!confirm) return;
    if (obs.id && (obs.fileUrl || obs.pathRel)) {
      // Observación existente: elimina storage y BD
      let storagePath = obs.pathRel;
      if (!storagePath && obs.fileUrl) {
        const match = obs.fileUrl.match(/(observations\/[^?]+)/);
        storagePath = match ? match[1] : undefined;
      }
      try {
        if (storagePath) {
          const { error: storageError } = await supabase.storage.from('reports').remove([storagePath]);
          if (storageError) throw new Error('Error borrando archivo: ' + storageError.message);
        }
        const { error: dbError } = await supabase.from('report_observations').delete().eq('id', obs.id);
        if (dbError) throw new Error('Error borrando observación: ' + dbError.message);
        setObservations(prev => prev.filter(o => o.id !== id));
        toast.success('Observación eliminada');
      } catch (err: any) {
        toast.error(err?.message || 'Error eliminando observación');
      }
    } else {
      // Observación local (no guardada): solo remover del estado
      setObservations(prev => prev.filter(o => o.id !== id));
    }
  };


  const handleFileChange = (id: string, file?: File) => {
    setObservations((prev) =>
      prev.map((obs) =>
        obs.id === id
          ? { ...obs, file, fileType: file?.type }
          : obs
      )
    );
  };

  const handleNoteChange = (id: string, note: string) => {
    setObservations((prev) =>
      prev.map((obs) =>
        obs.id === id
          ? { ...obs, note, updated: obs.fileUrl ? true : undefined }
          : obs
      )
    );
  };


  return (
    <div className="py-6">
      <label className="block text-md font-bold mb-2">Observaciones</label>
      <div className="flex flex-wrap gap-3">
        {observations.filter(obs => !obs.deleted).map((obs, idx) => (
          <div key={obs.id} className="relative flex flex-row items-start bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-full min-h-[100px] group my-4">
            <div className="relative w-24 h-24 md:w-32 md:h-32 flex-shrink-0 mr-3">
              {/* Miniatura imagen/video/archivo */}
              {obs.file ? (
                obs.file.type.startsWith('image') ? (
                  <div className="relative w-full h-full group">
                    <img src={URL.createObjectURL(obs.file)} className="object-cover w-full h-full rounded" />
                    <button
                      type="button"
                      className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Ver imagen observación"
                      onClick={() => setModalMedia({ url: URL.createObjectURL(obs.file), type: 'image' })}
                      style={{ backdropFilter: 'blur(2px)' }}
                      tabIndex={-1}
                    >
                      <span className="bg-white/80 rounded-full p-2 shadow border border-gray-200 hover:bg-blue-100 hover:text-blue-600 text-gray-700">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </span>
                    </button>
                  </div>
                ) : obs.file.type.startsWith('video') ? (
                  <div className="relative w-full h-full group">
                    <video src={URL.createObjectURL(obs.file)} className="object-cover w-full h-full rounded" />
                    <button
                      type="button"
                      className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Ver video observación"
                      onClick={() => setModalMedia({ url: URL.createObjectURL(obs.file), type: 'video' })}
                      style={{ backdropFilter: 'blur(2px)' }}
                      tabIndex={-1}
                    >
                      <span className="bg-white/80 rounded-full p-2 shadow border border-gray-200 hover:bg-blue-100 hover:text-blue-600 text-gray-700">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </span>
                    </button>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">Archivo</span>
                )
              ) : (
                <div className="relative w-24 h-24 md:w-32 md:h-32 group flex justify-center items-center">
                  <RenderSignedMedia fileUrl={obs.fileUrl} pathRel={obs.pathRel} fileType={obs.fileType} />
                  {/* Overlay previsualización centrado */}
                  {(obs.fileUrl || obs.pathRel) && (obs.fileType?.startsWith('image') || obs.fileType?.startsWith('video')) && (
                    <button
                      type="button"
                      className="z-10 flex items-center justify-center bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-24 h-24 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                      title={obs.fileType?.startsWith('image') ? 'Ver imagen observación' : 'Ver video observación'}
                      onClick={() => setModalMedia({ url: obs.fileUrl || '', pathRel: obs.pathRel, type: obs.fileType?.startsWith('image') ? 'image' : 'video' })}
                      style={{ backdropFilter: 'blur(2px)' }}
                      tabIndex={-1}
                    >
                      <span className="bg-white/80 rounded-full shadow border border-gray-200 hover:bg-blue-100 hover:text-blue-600 text-gray-700">
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <circle cx="12" cy="12" r="3" />
                          <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </span>
                    </button>
                  )}
                </div>
              )}
              <input
                id={`obs-file-${obs.id}`}
                type="file"
                accept="image/*,video/*"
                capture="environment"
                className="hidden"
                disabled={disabled}
                onChange={e => handleFileChange(obs.id, e.target.files?.[0])}
              />
              {/* Overlay para seleccionar archivo en observaciones nuevas */}
              {(!obs.file && !obs.fileUrl && !obs.pathRel) && !disabled && (
                <button
                  type="button"
                  className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/20 rounded opacity-100 hover:bg-black/30 transition"
                  style={{ backdropFilter: 'blur(2px)' }}
                  onClick={() => document.getElementById(`obs-file-${obs.id}`)?.click()}
                  tabIndex={-1}
                >
                  <span className="bg-white/90 rounded-full p-3 shadow border border-gray-200 text-gray-700 mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13h6m2 7a2 2 0 002-2V7.828a2 2 0 00-.586-1.414l-4.828-4.828A2 2 0 0013.172 1H7a2 2 0 00-2 2v16a2 2 0 002 2h10z" />
                    </svg>
                  </span>
                  <span className="text-xs text-white font-semibold">Agregar archivo</span>
                </button>
              )}
              {/* Nombre archivo */}
              {obs.file && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 truncate">{obs.file.name}</span>
              )}
            </div>
            {/* Nota */}
            <textarea
              className="flex-1 w-full h-full min-h-[70px] max-h-[110px] border border-blue-300 rounded-md px-3 py-2 text-base resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition bg-white shadow-md outline-none"
              placeholder="Nota de la observación"
              value={obs.note}
              disabled={disabled}
              onChange={e => handleNoteChange(obs.id, e.target.value)}
            />
            {/* Botón eliminar (caneca) */}
            <button
              type="button"
              className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center text-red-500 bg-white rounded-full shadow hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400 z-20"
              onClick={() => handleRemove(obs.id)}
              disabled={disabled}
              title="Eliminar observación"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a1 1 0 011 1v2H9V4a1 1 0 011-1z" /></svg>
            </button>
            {/* Botón Guardar/Actualizar como icono al lado del eliminar */}
            {!disabled && (!obs.pathRel || obs.isNew) && (
              <button
                type="button"
                className={`absolute top-1 right-10 w-7 h-7 flex items-center justify-center text-blue-600 bg-white rounded-full shadow hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 z-20 ${savingObs === obs.id ? 'opacity-60 pointer-events-none' : ''}`}
                onClick={() => handleSaveObservation(obs.id)}
                title="Guardar observación"
              >
                {savingObs === obs.id ? (
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                ) : (
                  // Icono disquete (guardar)
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 3a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2h10z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 3v4h10V3" />
                    <rect x="9" y="13" width="6" height="4" rx="1" />
                  </svg>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        className="flex items-center gap-1 px-2 py-1 bg-gray-200 text-gray-800 border border-gray-400 rounded hover:bg-gray-300 text-sm font-medium shadow-sm transition-colors"
        onClick={handleAdd}
        disabled={disabled}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8m-4-4h8" />
        </svg>
        <span>Observación</span>
      </button>

      {/* Modal de visualización ampliada */}
      {modalMedia && (
        <ModalMediaViewer modalMedia={modalMedia} onClose={() => setModalMedia(undefined)} />
      )}
    </div>
  );
};

// Modal profesional para imagen/video, soporta storage firmado
const ModalMediaViewer: React.FC<{
  modalMedia: { url: string; pathRel?: string; type: 'image' | 'video' };
  onClose: () => void;
}> = ({ modalMedia, onClose }) => {
  const [signedUrl, setSignedUrl] = React.useState<string>(modalMedia.url);
  React.useEffect(() => {
    let mounted = true;
    const fetchSigned = async () => {
      if ((!modalMedia.url || modalMedia.url === '') && modalMedia.pathRel) {
        const { data, error } = await supabase.storage.from('reports').createSignedUrl(modalMedia.pathRel, 60 * 60);
        if (!error && data?.signedUrl && mounted) setSignedUrl(data.signedUrl);
      }
    };
    fetchSigned();
    return () => { mounted = false; };
  }, [modalMedia.url, modalMedia.pathRel]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative max-w-full max-h-full flex flex-col items-center justify-center">
        <button
          className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow text-gray-700 z-10"
          onClick={onClose}
          title="Cerrar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {modalMedia.type === 'image' ? (
          <img
            src={signedUrl}
            alt="Observación ampliada"
            className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-xl border-4 border-white object-contain bg-white"
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <video
            src={signedUrl}
            controls
            autoPlay
            className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-xl border-4 border-white bg-black"
            onClick={e => e.stopPropagation()}
          />
        )}
      </div>
      {/* Cierre modal al hacer clic fuera */}
      <div className="fixed inset-0 z-40" onClick={onClose} />
    </div>
  );
};

export default ObservationsSection;
