import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
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
  const [observations, setObservations] = useState<Observation[]>(initialObservations);

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

  const handleRemove = (id: string) => {
    setObservations((prev) =>
      prev.map((obs) =>
        obs.id === id && obs.fileUrl
          ? { ...obs, deleted: true }
          : obs.id === id
          ? null
          : obs
      ).filter(Boolean) as Observation[]
    );
    // onObservationsChange se llama más abajo por el useEffect
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

  // Upload file to Supabase Storage and return the public URL
  const uploadFile = async (file: File, obsId: string): Promise<{ url?: string; type?: string }> => {
    const ext = file.name.split('.').pop();
    const filePath = `${FOLDER}/${uuidv4()}.${ext}`;
    const { error } = await supabase.storage.from(BUCKET).upload(filePath, file);
    if (error) {
      alert('Error subiendo archivo: ' + error.message);
      return {};
    }
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return { url: data.publicUrl, type: file.type };
  };

  // Save all observations (call this from parent on submit)
  const saveObservations = async () => {
    if (!reportId) return;
    for (const obs of observations) {
      let fileUrl = obs.fileUrl;
      let fileType = obs.fileType;
      if (obs.file && !fileUrl) {
        const upload = await uploadFile(obs.file, obs.id);
        fileUrl = upload.url;
        fileType = upload.type;
      }
      // Insert into DB (report_observations)
      if (fileUrl) {
        await supabase.from('report_observations').insert({
          report_id: reportId,
          file_type: fileType,
          path: fileUrl,
          note: obs.note,
        });
      }
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">Observaciones</label>
      <div className="flex flex-wrap gap-3">
        {observations.filter(obs => !obs.deleted).map((obs, idx) => (
          <div key={obs.id} className="relative flex flex-row items-start bg-white border border-gray-200 rounded-lg shadow-lg p-2 w-full min-h-[100px] group my-4">
            {/* Miniatura con overlay y botón archivo */}
            <div className="relative w-[72px] h-[72px] flex-shrink-0 mr-0 sm:mr-3 mb-2 sm:mb-0">
              {/* Imagen/video/file */}
              <div className="w-full h-full rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                {obs.file ? (
                  obs.file.type.startsWith('image') ? (
                    <img src={URL.createObjectURL(obs.file)} alt="preview" className="object-cover w-full h-full" />
                  ) : obs.file.type.startsWith('video') ? (
                    <video src={URL.createObjectURL(obs.file)} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-xs text-gray-400">Archivo</span>
                  )
                ) : (
                  <RenderSignedMedia fileUrl={obs.fileUrl} pathRel={obs.pathRel} fileType={obs.fileType} />
                )}
                {/* Overlay icono archivo */}
                <button
                  type="button"
                  className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Seleccionar archivo"
                  onClick={() => !disabled && document.getElementById(`obs-file-${obs.id}`)?.click()}
                  disabled={disabled}
                  tabIndex={-1}
                >
                  {/* Ícono de imagen (landscape/photo) */}
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
                    <circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
                    <path d="M21 19l-5.5-7-4.5 6-3-4L3 19" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                </button>
                <input
                  id={`obs-file-${obs.id}`}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  disabled={disabled}
                  onChange={e => handleFileChange(obs.id, e.target.files?.[0])}
                />
              </div>
              {/* Nombre archivo */}
              {obs.file && (
                <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] px-1 truncate">{obs.file.name}</span>
              )}
            </div>
            {/* Nota */}
            <textarea
              className="flex-1 min-w-0 min-h-[70px] max-h-[110px] border border-blue-300 rounded-md px-3 py-2 text-base resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 transition bg-white shadow-md outline-none ml-2"
              placeholder="Nota de la observación"
              value={obs.note}
              disabled={disabled}
              onChange={e => handleNoteChange(obs.id, e.target.value)}
            />
            {/* Botón eliminar (caneca) */}
            <button
              type="button"
              className="absolute top-1 right-1 w-7 h-7 flex items-center justify-center text-red-500 bg-white rounded-full shadow hover:bg-red-50 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
              onClick={() => handleRemove(obs.id)}
              disabled={disabled}
              title="Eliminar observación"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a1 1 0 011 1v2H9V4a1 1 0 011-1z" /></svg>
            </button>
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
    </div>
  );
};

export default ObservationsSection;
