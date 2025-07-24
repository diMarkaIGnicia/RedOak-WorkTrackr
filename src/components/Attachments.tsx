import React, { useRef, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

export interface Attachment {
  id?: number;
  report_id: number;
  path: string;
  file_type: string;
  fileUrl?: string; // Signed URL para mostrar
}

interface AttachmentsProps {
  reportId?: number;
  readOnly?: boolean;
}

const BUCKET = 'reports';
const FOLDER = 'attachments';

const Attachments: React.FC<AttachmentsProps> = ({ reportId, readOnly }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState('');
  const [removingId, setRemovingId] = useState<number | undefined>(undefined);
  const [modalMedia, setModalMedia] = useState<{ url: string, type: 'image' | 'video' } | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cargar adjuntos ya guardados al cargar el componente
  React.useEffect(() => {
    if (!reportId) return;
    const fetchAttachments = async () => {
      const { data, error } = await supabase
        .from('report_attachments')
        .select('id, report_id, path, file_type')
        .eq('report_id', reportId);
      if (!error && data) {
        // Obtener signed URLs
        const withUrls = await Promise.all(
          data.map(async (att: Attachment) => {
            const { data: signed, error: signErr } = await supabase.storage
              .from(BUCKET)
              .createSignedUrl(att.path, 60 * 60);
            return {
              ...att,
              fileUrl: signed?.signedUrl || '',
            };
          })
        );
        setAttachments(withUrls);
      }
    };
    fetchAttachments();
  }, [reportId]);

  // Previsualización al seleccionar archivo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file || null);
    setError('');
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setPreview(null);
    }
  };

  // Subir archivo al storage y guardar en DB
  const handleUpload = async () => {
    if (!selectedFile || !reportId) return;
    setUploading(true);
    setError('');
    try {
      const ext = selectedFile.name.split('.').pop();
      const filePath = `${FOLDER}/${reportId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(filePath, selectedFile, { upsert: false });
      if (uploadErr) throw uploadErr;
      // Guardar registro en tabla
      const { data, error: dbErr } = await supabase.from('report_attachments').insert({
        report_id: reportId,
        path: filePath,
        file_type: selectedFile.type,
      }).select();
      if (dbErr) throw dbErr;
      // Obtener URL firmada
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(filePath, 60 * 60);
      setAttachments(prev => [
        ...prev,
        {
          id: data?.[0]?.id,
          report_id: reportId,
          path: filePath,
          file_type: selectedFile.type,
          fileUrl: signed?.signedUrl || '',
        },
      ]);
      setSelectedFile(null);
      setPreview(null);
      toast.success('Archivo cargado correctamente');
    } catch (err: any) {
      toast.error('Error al cargar el archivo: ' + (err?.message || ''));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <Toaster position="top-right" />
      <label className="block text-sm font-medium mb-1">Adjuntar archivos, fotos o videos</label>
      {!readOnly && (
        <div className="flex items-center gap-3 mb-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={handleFileSelect}
            disabled={uploading}
          />
          <button
            type="button"
            className="px-3 py-1 bg-gray-200 border border-gray-400 rounded hover:bg-gray-300 text-gray-800 flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="8.5" cy="10.5" r="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M21 19l-5.5-7-4.5 6-3-4L3 19" stroke="currentColor" strokeWidth="2" fill="none" />
            </svg>
            Seleccionar archivo
          </button>
          {selectedFile && (
            <button
              type="button"
              className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1"
              onClick={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" fill="none" />
                  <polyline points="7 10 12 15 17 10" stroke="currentColor" strokeWidth="2" fill="none" />
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" />
                </svg>
              )}
              Cargar
            </button>
          )}
        </div>
      )}
      {/* Preview */}
      {preview && (
        <div className="mb-2">
          {selectedFile?.type.startsWith('image') ? (
            <img src={preview} alt="preview" className="w-24 h-24 object-cover rounded shadow" />
          ) : selectedFile?.type.startsWith('video') ? (
            <video src={preview} controls className="w-24 h-24 object-cover rounded shadow" />
          ) : null}
          <div className="text-xs text-gray-500 mt-1">{selectedFile?.name}</div>
        </div>
      )}
      {/* Miniaturas */}
      <div className="flex gap-2 flex-wrap mt-2">
        {attachments.map(att => (
          <div key={att.id || att.path} className="relative group">
            {/* Botón eliminar */}
            {!readOnly && (
              <button
                type="button"
                className="absolute -top-2 -right-2 z-10 bg-white rounded-full p-1 shadow-lg border border-gray-200 opacity-80 group-hover:opacity-100 transition-opacity hover:bg-red-100 hover:text-red-600 text-gray-400"
                title="Eliminar adjunto"
                onClick={async () => {
                  if (removingId) return;
                  if (window.confirm('¿Seguro que deseas eliminar este archivo? Esta acción no se puede deshacer.')) {
                    setRemovingId(att.id);
                    // Eliminar de Storage
                    const { error: storageErr } = await supabase.storage.from(BUCKET).remove([att.path]);
                    // Eliminar de DB
                    const { error: dbErr } = await supabase.from('report_attachments').delete().eq('id', att.id);
                    if (storageErr || dbErr) {
                      toast.error('Error al eliminar el archivo');
                    } else {
                      setAttachments(prev => prev.filter(a => a.id !== att.id));
                      toast.success('Archivo eliminado correctamente');
                    }
                    setRemovingId(undefined);
                  }
                }}
                style={{ pointerEvents: removingId ? 'none' : 'auto', opacity: removingId === att.id ? 0.5 : 1 }}
                disabled={!!removingId}
              >
                {removingId === att.id ? (
                  <svg className="animate-spin w-5 h-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M10 3h4a1 1 0 011 1v2H9V4a1 1 0 011-1z"></path></svg>
                )}
              </button>
            )}
            {/* Botón ver imagen o video centrado */}
            {(att.file_type.startsWith('image') || att.file_type.startsWith('video')) && (
              <button
                type="button"
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/10 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                title={att.file_type.startsWith('image') ? 'Ver imagen adjunta' : 'Ver video adjunto'}
                onClick={() => setModalMedia({ url: att.fileUrl, type: att.file_type.startsWith('image') ? 'image' : 'video' })}
                style={{ backdropFilter: 'blur(2px)' }}
              >
                <span className="bg-white/80 rounded-full p-2 shadow border border-gray-200 hover:bg-blue-100 hover:text-blue-600 text-gray-700">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </span>
              </button>
            )}
            {att.file_type.startsWith('image') ? (
              <img src={att.fileUrl} alt="adjunto" className="w-24 h-24 md:w-32 md:h-32 object-cover rounded border" />
            ) : att.file_type.startsWith('video') ? (
              <video src={att.fileUrl} controls className="w-24 h-24 md:w-32 md:h-32 object-cover rounded border" />
            ) : (
              <a href={att.fileUrl} target="_blank" rel="noopener noreferrer" className="block w-24 h-24 md:w-32 md:h-32 bg-gray-100 border rounded flex items-center justify-center text-xs text-blue-700 underline">Ver archivo</a>
            )}
          </div>
        ))}
      </div>

      {/* Modal de visualización ampliada */}
      {modalMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="relative max-w-full max-h-full flex flex-col items-center justify-center">
            <button
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-2 shadow text-gray-700 z-10"
              onClick={() => setModalMedia(undefined)}
              title="Cerrar"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            {modalMedia.type === 'image' ? (
              <img
                src={modalMedia.url}
                alt="Adjunto ampliado"
                className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-xl border-4 border-white object-contain bg-white"
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <video
                src={modalMedia.url}
                controls
                autoPlay
                className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-xl border-4 border-white bg-black"
                onClick={e => e.stopPropagation()}
              />
            )}
          </div>
          {/* Cierre modal al hacer clic fuera */}
          <div className="fixed inset-0 z-40" onClick={() => setModalMedia(undefined)} />
        </div>
      )}

    </div>
  );
};

export default Attachments;
