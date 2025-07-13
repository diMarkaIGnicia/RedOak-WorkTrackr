import React from 'react';

interface TaskCardProps {
  title: string;
  description: string;
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ title, description, completed, onToggle, onDelete, onEdit }) => (
  <div className={`bg-white rounded-2xl shadow-md border p-4 flex flex-col gap-2 transition-all hover:shadow-lg relative ${completed ? 'opacity-60' : ''}`}>
    <div className="flex items-center gap-2">
      <input type="checkbox" checked={completed} onChange={onToggle} className="accent-blue w-5 h-5" />
      <h3 className={`font-bold text-lg ${completed ? 'line-through text-gray-400' : 'text-blue-dark'}`}>{title}</h3>
    </div>
    <p className={`text-gray-600 text-sm ${completed ? 'line-through' : ''}`}>{description}</p>
    <div className="flex gap-3 mt-2">
      <button onClick={onEdit} className="text-xs text-blue-dark hover:underline">Editar</button>
      <button onClick={onDelete} className="text-xs text-red-700 hover:underline">Eliminar</button>
    </div>
    {completed && <span className="absolute top-2 right-3 text-xs text-green-600 font-semibold">Completada</span>}
  </div>
);

export default TaskCard;
