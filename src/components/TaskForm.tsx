import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';


export interface TaskFormValues {
  fecha_inicio: string;
  hora_inicio: string;
  cliente: string;
  tipo_trabajo: string;
  horas_trabajadas: number;
  tarifa_por_hora: number;
  estado: string;
  descripcion?: string;
}

interface TaskFormProps {
  initialValues?: TaskFormValues;
  onSubmit?: (values: TaskFormValues, attachments: Array<{ file: File, tipo_archivo: string }>) => void;
  onCancel: () => void;
  submitLabel?: string;
  readOnly?: boolean;
}

const TIPOS_TRABAJO = [
  'Doméstico',
  'Comercial',
  'Entrenamiento'
];

const ESTADOS = ['Creada', 'Enviada', 'Pagada'];

export const TaskForm: React.FC<TaskFormProps & { rol: string }> = ({ initialValues, onSubmit, onCancel, submitLabel, rol, readOnly = false }) => {

  // Detectar si es edición (tiene id) o creación
  const isEdit = !!initialValues?.id;

  // Adjuntos ya guardados en la BD
  const [savedFiles, setSavedFiles] = React.useState<Array<{ id: string, archivo_path: string, tipo_archivo: string }>>([]);
  const [signedUrls, setSignedUrls] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    const fetchAdjuntos = async () => {
      if (isEdit && initialValues?.id) {
        const { data, error } = await supabase
          .from('tarea_adjuntos')
          .select('id, archivo_path, tipo_archivo')
          .eq('tarea_id', initialValues.id);
        if (!error && data) {
          setSavedFiles(data);
          // Generar URLs firmadas para cada archivo
          const urls: Record<string, string> = {};
          for (const file of data) {
            // Asegurarse que el path sea relativo al bucket: adjuntos/<tarea_id>/archivo
            let relativePath = file.archivo_path;
            if (!relativePath.startsWith('adjuntos/')) {
              // Si el path viene como <tarea_id>/archivo.jpg, ajusta
              relativePath = `adjuntos/${relativePath}`;
            }
            const { data: signed, error: signErr } = await supabase.storage.from('tareas').createSignedUrl(relativePath, 60 * 60);
            if (!signErr && signed?.signedUrl) {
              urls[file.id] = signed.signedUrl;
            }
          }
          setSignedUrls(urls);
        }
      }
    };
    fetchAdjuntos();
  }, [isEdit, initialValues?.id]);

  const [form, setForm] = useState<TaskFormValues>(
    initialValues || {
      fecha_inicio: '',
      hora_inicio: '',
      cliente: '',
      tipo_trabajo: '',
      horas_trabajadas: 0,
      tarifa_por_hora: 0,
      estado: rol === 'empleado' ? 'Creada' : 'Creada',
      descripcion: '',
    }
  );
  const [error, setError] = useState('');


  // Eliminar adjunto
  const removeAttachment = (idx: number) => {
    setAttachments((prev: Array<{ file: File, tipo_archivo: string }>) => prev.filter((_, i) => i !== idx));
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f: TaskFormValues) => ({
      ...f,
      [name]: name === 'horas_trabajadas' || name === 'tarifa_por_hora' ? parseFloat(value) || 0 : value,
    }));
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (readOnly) return;
    if (!form.fecha_inicio || !form.hora_inicio || !form.cliente || !form.tipo_trabajo) {
      setError('Completa todos los campos obligatorios.');
      return;
    }
    setError('');
    // Solo pasa los datos y adjuntos al padre
    onSubmit && onSubmit({ ...form, descripcion: form.descripcion || undefined }, attachments);
  };

  // --- Adjuntos ---
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  // Adjuntos: archivos generales
  const [attachments, setAttachments] = React.useState<Array<{ file: File, tipo_archivo: string }>>([]);

  // Previews para adjuntos nuevos
  const [attachmentPreviews, setAttachmentPreviews] = React.useState<string[]>([]);
  React.useEffect(() => {
    const generatePreviews = async () => {
      const previews: string[] = [];
      for (const att of attachments) {
        if (att.file.type.startsWith('image/') || att.file.type.startsWith('video/')) {
          const reader = new FileReader();
          const url = await new Promise<string>((resolve) => {
            reader.onload = e => resolve(e.target?.result as string);
            reader.readAsDataURL(att.file);
          });
          previews.push(url);
        } else {
          previews.push('');
        }
      }
      setAttachmentPreviews(previews);
    };
    if (attachments.length > 0) {
      generatePreviews();
    } else {
      setAttachmentPreviews([]);
    }
  }, [attachments]);

  const [fileError, setFileError] = React.useState<string>("");

  // Eliminar adjunto guardado con confirmación y feedback visual
  const [removingId, setRemovingId] = React.useState<string | null>(null);
  const removeSavedFile = async (id: string, archivo_path: string) => {
    const confirm = window.confirm('¿Estás seguro de que deseas eliminar este adjunto? Esta acción no se puede deshacer.');
    if (!confirm) return;
    setRemovingId(id);
    let relativePath = archivo_path;
    if (!relativePath.startsWith('adjuntos/')) {
      relativePath = `adjuntos/${relativePath}`;
    }
    let storageError = false;
    let dbError = false;
    // 1. Eliminar de Storage
    const { error: storageErr } = await supabase.storage.from('tareas').remove([relativePath]);
    if (storageErr) storageError = true;
    // 2. Eliminar de la base de datos
    const { error: dbErr } = await supabase.from('tarea_adjuntos').delete().eq('id', id);
    if (dbErr) dbError = true;
    // 3. Actualizar UI
    setSavedFiles(prev => prev.filter(f => f.id !== id));
    setRemovingId(null);
    if (storageError || dbError) {
      setFileError('Error al eliminar el adjunto. Intenta de nuevo.');
      alert('Error al eliminar el adjunto. Intenta de nuevo.');
    } else {
      setFileError('');
      alert('Adjunto eliminado correctamente.');
    }
  };



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, tipo_archivo: string = "documento") => {
    if (!e.target.files) return;
    setFileError("");
    const files = Array.from(e.target.files);
    const validFiles: Array<{ file: File, tipo_archivo: string }> = [];
    for (const file of files) {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      if (isImage && file.size > 5 * 1024 * 1024) {
        setFileError('El tamaño máximo para fotos es 5MB.');
        continue;
      }
      if (isVideo && file.size > 10 * 1024 * 1024) {
        setFileError('El tamaño máximo para videos es 10MB.');
        continue;
      }
      let tipo: string = 'documento';
      if (isImage) tipo = 'foto';
      else if (isVideo) tipo = 'video';
      if (!isImage && !isVideo && file.size > 10 * 1024 * 1024) {
        setFileError('El tamaño máximo para documentos es 10MB.');
        continue;
      }
      validFiles.push({ file, tipo_archivo: tipo });
    }
    setAttachments((prev: Array<{ file: File, tipo_archivo: string }>) => [
      ...prev,
      ...validFiles.filter(f => !prev.some(p => p.file.name === f.file.name && p.file.size === f.file.size))
    ]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.files) return;
    const files = Array.from(e.dataTransfer.files);
    const validFiles: Array<{ file: File, tipo_archivo: string }> = files.map(file => {
      const isImage = file.type.startsWith('image/');
      const isVideo = file.type.startsWith('video/');
      let tipo: string = 'documento';
      if (isImage) tipo = 'foto';
      else if (isVideo) tipo = 'video';
      return { file, tipo_archivo: tipo };
    });
    setAttachments((prev: Array<{ file: File, tipo_archivo: string }>) => [
      ...prev,
      ...validFiles.filter(f => !prev.some(p => p.file.name === f.file.name && p.file.size === f.file.size))
    ]);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* --- Campos básicos de la tarea --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Fecha inicio <span className="text-red-500">*</span></label>
          <input type="date" className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" name="fecha_inicio" value={form.fecha_inicio} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Hora inicio <span className="text-red-500">*</span></label>
          <input type="time" className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" name="hora_inicio" value={form.hora_inicio} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cliente <span className="text-red-500">*</span></label>
          <input type="text" className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" name="cliente" value={form.cliente} onChange={handleChange} required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tipo de trabajo <span className="text-red-500">*</span></label>
          <select className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" name="tipo_trabajo" value={form.tipo_trabajo} onChange={handleChange} required>
            <option value="">Selecciona...</option>
            {TIPOS_TRABAJO.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Horas trabajadas <span className="text-red-500">*</span></label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition"
            name="horas_trabajadas"
            value={form.horas_trabajadas}
            onChange={handleChange}
            min={0}
            step={0.1}
            required
            onFocus={e => e.target.select()}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Tarifa por hora <span className="text-red-500">*</span></label>
          <div className="flex items-center border border-gray-300 rounded-lg px-2 py-1 shadow-sm focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-500 bg-white">
            <span className="text-blue-600 font-normal mr-2">$</span>
            <input
              type="number"
              className="flex-1 outline-none bg-transparent px-2 py-1 placeholder-gray-400 focus:ring-0 border-none shadow-none"
              name="tarifa_por_hora"
              value={form.tarifa_por_hora}
              onChange={handleChange}
              min={0}
              step={0.01}
              required
              placeholder="0.00"
              onFocus={e => e.target.select()}
            />

          </div>
        </div>
        {rol === 'administrador' && (
          <div>
            <label className="block text-sm font-medium mb-1">Estado <span className="text-red-500">*</span></label>
            <select className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" name="estado" value={form.estado} onChange={handleChange} required>
              {ESTADOS.map(estado => <option key={estado} value={estado}>{estado}</option>)}
            </select>
          </div>
        )}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1">Descripción</label>
          <textarea className="w-full border border-gray-300 rounded px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition" name="descripcion" value={form.descripcion} onChange={handleChange} rows={3} />
        </div>
      </div>
      {/* --- Adjuntos generales --- */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1 flex items-center gap-1">Archivos Adjuntos
          <span className="relative group cursor-pointer ml-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="white" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 16v-4m0-4h.01" />
            </svg>
            <div className="absolute left-1/2 -translate-x-1/2 top-7 z-20 w-72 bg-white border border-gray-200 rounded shadow-lg p-3 text-xs text-gray-700 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity duration-200">
              <div className="font-bold text-blue-700 mb-2 text-sm">Guía para adjuntar archivos</div>
              <ul className="list-disc ml-4 space-y-1">
                <li><span className="font-semibold">Formatos aceptados:</span> JPG, PNG, MP4, PDF.</li>
                <li><span className="font-semibold">Tamaño máximo:</span> Imágenes 5&nbsp;MB, videos 10&nbsp;MB, documentos 10&nbsp;MB.</li>
                <li><span className="font-semibold">Máximo recomendado:</span> 10 archivos por tarea.</li>
              </ul>
            </div>
          </span>
        </label>
        <div className="flex flex-row justify-center gap-3 mt-4">
          {/* Botón para tomar foto o video */}
          {!readOnly && (
            <>
              <button
                type="button"
                className="flex flex-col items-center gap-1 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow transition text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-300"
                onClick={() => cameraInputRef.current?.click()}
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h2l2-3h10l2 3h2a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V9a2 2 0 012-2zm9 6a3 3 0 100-6 3 3 0 000 6z" />
                </svg>
                <span className="text-xs mt-1">Tomar foto o video</span>
              </button>
              {/* Botón para cargar archivo desde dispositivo */}
              <button
                type="button"
                className="flex flex-col items-center gap-1 px-4 py-2 border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 rounded-lg shadow transition text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-200"
                onClick={() => fileInputRef.current?.click()}
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 9l5-5 5 5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v12" />
                </svg>
                <span className="text-xs mt-1">Cargar desde dispositivo</span>
              </button>
            </>
          )}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileChange}
            accept="image/*,video/*,application/pdf"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*,video/*"
            capture="environment"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
        {fileError && <span className="text-xs text-red-500 ml-2">{fileError}</span>}
        {/* Previsualización de adjuntos guardados (BD) */}
        {isEdit && savedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {savedFiles.map((file) => {
              const isImage = /\.(jpg|jpeg|png|webp|gif|bmp)$/i.test(file.archivo_path);
              const isVideo = /\.(mp4|mov|avi|webm|ogg|mkv)$/i.test(file.archivo_path);
              const isPdf = /\.pdf$/i.test(file.archivo_path);
              const fileUrl = signedUrls[file.id];
              return (
                <div key={file.id} className="relative bg-gray-100 rounded p-2 flex items-center gap-2 min-w-[8rem]">
                  {!fileUrl ? (
                    <span className="text-xs text-gray-400">Cargando...</span>
                  ) : isImage ? (
                    <div className="relative group w-32 h-32 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                      <div className="w-full h-full relative">
                        <img
                          src={fileUrl}
                          alt={file.archivo_path.split('/').pop()}
                          className="w-full h-full object-cover"
                          onLoad={e => e.currentTarget.parentElement?.querySelector('.preview-loader')?.classList.add('hidden')}
                          onError={e => e.currentTarget.parentElement?.querySelector('.preview-loader')?.classList.add('hidden')}
                          style={{ transition: 'filter 0.3s' }}
                        />
                        <div className="preview-loader absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm z-10">
                          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                        </div>
                      </div>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-200 cursor-pointer"
                        title="Ver imagen adjunta"
                      >
                        <svg className="opacity-0 group-hover:opacity-100 text-white w-7 h-7 transition duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </a>
                    </div>
                  ) : isVideo ? (
                    <div className="relative group w-32 h-32 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                      <video
                        src={fileUrl}
                        className="w-full h-full object-cover"
                        controls={false}
                        muted
                        preload="metadata"
                      />
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-200 cursor-pointer"
                        title="Ver video adjunto"
                      >
                        <svg className="opacity-0 group-hover:opacity-100 text-white w-9 h-9 transition duration-200" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </a>
                    </div>
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-200 border border-gray-300 rounded shadow-sm">
                      {isPdf ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7v10M17 7v10M7 7h10M7 17h10M12 12v5" /></svg>
                      )}
                    </div>
                  )}

                  {!readOnly && (
                    <button
                      type="button"
                      className="absolute top-1 right-1 z-10 bg-white bg-opacity-80 rounded-full text-red-500 hover:text-red-700 shadow px-1 py-0.5 text-lg leading-none focus:outline-none disabled:opacity-50"
                      onClick={() => removeSavedFile(file.id, file.archivo_path)}
                      title="Eliminar adjunto guardado"
                      disabled={removingId === file.id}
                      style={{ lineHeight: 1 }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* Previsualización de adjuntos nuevos (no guardados) */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {attachments.map((att, idx) => {
              const isImage = att.file.type.startsWith('image/');
              const isVideo = att.file.type.startsWith('video/');
              const isPdf = att.file.type === 'application/pdf';
              const previewUrl = attachmentPreviews[idx] || null;
              return (
                <div key={idx} className="relative bg-gray-100 rounded p-2 flex items-center gap-2 min-w-[8rem]">
                  <button
                    type="button"
                    className="absolute top-1 right-1 z-10 bg-white bg-opacity-80 rounded-full text-red-500 hover:text-red-700 shadow px-1 py-0.5 text-lg leading-none focus:outline-none"
                    onClick={() => removeAttachment(idx)}
                    title="Eliminar adjunto"
                    style={{ lineHeight: 1 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" /></svg>
                  </button>
                  {isImage && previewUrl ? (
                    <div className="relative group w-32 h-32 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                      <div className="w-full h-full relative">
                        <img
                          src={previewUrl}
                          alt={att.file.name}
                          className="w-full h-full object-cover"
                          onLoad={e => e.currentTarget.parentElement?.querySelector('.preview-loader')?.classList.add('hidden')}
                          onError={e => e.currentTarget.parentElement?.querySelector('.preview-loader')?.classList.add('hidden')}
                          style={{ transition: 'filter 0.3s' }}
                        />
                        <div className="preview-loader absolute inset-0 flex items-center justify-center bg-white bg-opacity-60 backdrop-blur-sm z-10">
                          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                        </div>
                      </div>
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-200 cursor-pointer"
                        title="Ver imagen adjunta"
                        tabIndex={-1}
                        onClick={e => e.stopPropagation()}
                      >
                        <svg className="opacity-0 group-hover:opacity-100 text-white w-7 h-7 transition duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </a>
                    </div>
                  ) : isVideo && previewUrl ? (
                    <div className="relative group w-32 h-32 rounded-lg overflow-hidden border border-gray-300 shadow-sm">
                      <video src={previewUrl} className="w-full h-full object-cover" controls={false} muted preload="metadata" />
                      <a
                        href={previewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-40 transition duration-200 cursor-pointer"
                        title="Ver video adjunto"
                        tabIndex={-1}
                        onClick={e => e.stopPropagation()}
                      >
                        <svg className="opacity-0 group-hover:opacity-100 text-white w-9 h-9 transition duration-200" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </a>
                    </div>
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center bg-gray-200 border border-gray-300 rounded shadow-sm">
                      {isPdf ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7v10M17 7v10M7 7h10M7 17h10M12 12v5" /></svg>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* Botones de acción */}
      <div className="mt-6 flex gap-4 justify-end">
        <button type="button" className="px-4 py-2 bg-gray-300 rounded" onClick={onCancel}>Cancelar</button>
        {!readOnly && (
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 shadow">{submitLabel || "Guardar"}</button>
        )}
      </div>
    </form>
  );
}

export default TaskForm;
