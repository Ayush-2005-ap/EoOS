export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel 
}: { 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-primary mb-4">{title}</h3>
        <p className="text-slate-600 mb-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: message }} />
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-5 py-2.5 bg-error text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-sm"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}
