import React, { useState } from 'react';

interface InlineEditableObservacionProps {
  observacion: {
    id: string;
    archivo_path: string;
    tipo_archivo: string;
    nota: string;
  };
  url?: string;
  onUpdate: (newFile: File | null, newNota: string) => void;
  readOnly?: boolean;
  removing?: boolean;
  onRemove?: () => void;
}

export const InlineEditableObservacion: React.FC<InlineEditableObservacionProps> = ({
  observacion,
  url,
  onUpdate,
  readOnly = false,
  removing = false,
  onRemove,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [nota, setNota] = useState(observacion.nota);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | undefined>(url);

  // Sincroniza preview con url cuando cambia la prop url (por ejemplo, cuando llega la signedUrl)
  React.useEffect(() => {
    if (!file && url) {
      setPreview(url);
    }
  }, [url, file]);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target?.result as string);
      reader.readAsDataURL(f);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    await onUpdate(file, nota);
    setEditMode(false);
    setLoading(false);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center gap-4 bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm relative">
      {/* Bloque de imagen/video */}
      <div className="flex flex-col items-center gap-2 min-w-[128px]">
        {preview && (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <img src={preview} alt={`Observación (${observacion.tipo_archivo})`} className="rounded-lg object-cover w-32 h-32 border border-blue-200 shadow" />
          </a>
        )}
        {preview && observacion.tipo_archivo === 'video' && (
          <a href={url} target="_blank" rel="noopener noreferrer">
            <video src={preview} controls className="rounded-lg object-cover w-32 h-32 border border-blue-200 shadow" />
          </a>
        )}
        {editMode && !readOnly && (
          <>
            <input
              id={`obs-edit-file-${observacion.id}`}
              type="file"
              accept="image/*,video/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              className="mt-2 px-2 py-1 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow text-xs focus:outline-none"
              onClick={() => document.getElementById(`obs-edit-file-${observacion.id}`)?.click()}
              disabled={loading}
            >
              Cambiar foto/video
            </button>
          </>
        )}
      </div>
      {/* Bloque de nota */}
      <div className="flex-1 flex flex-col">
        <label className="block text-xs font-semibold mb-1">Nota</label>
        {editMode && !readOnly ? (
          <textarea
            className="w-full min-h-[60px] border border-blue-200 rounded p-2 text-sm focus:ring-2 focus:ring-blue-100 resize-y"
            value={nota}
            onChange={e => setNota(e.target.value)}
            disabled={loading}
          />
        ) : (
          <div className="text-sm text-gray-700 whitespace-pre-wrap bg-white/70 rounded p-2 border border-blue-100">{observacion.nota}</div>
        )}
      </div>
      {/* Acciones */}
      {!readOnly && (
        <div className="flex flex-row gap-2 absolute top-2 right-2 items-end">
          {editMode ? (
            <>
              <button
                type="button"
                className="bg-blue-600 text-white rounded px-3 py-1 text-xs font-semibold shadow hover:bg-blue-700 disabled:opacity-60"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                type="button"
                className="bg-gray-200 text-gray-700 rounded px-2 py-1 text-xs font-semibold shadow hover:bg-gray-300"
                onClick={() => { setEditMode(false); setNota(observacion.nota); setFile(null); setPreview(url); }}
                disabled={loading}
              >
                Cancelar
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="bg-blue-500 text-white rounded px-2 py-1 text-xs font-semibold shadow hover:bg-blue-600 flex items-center justify-center"
                onClick={() => setEditMode(true)}
                title="Editar observación"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487a2.75 2.75 0 1 1 3.89 3.89L7.5 21.5H3v-4.5L16.862 4.487Z" /></svg>
              </button>
              {onRemove && (
                <button
                  type="button"
                  className="text-red-500 hover:text-red-700 bg-white bg-opacity-80 rounded-full shadow px-2 py-1"
                  onClick={onRemove}
                  disabled={removing}
                  title="Eliminar observación"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3"></path></svg>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
