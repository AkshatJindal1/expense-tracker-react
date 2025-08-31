import React from 'react';

export const ConfirmationModal = ({ config, onConfirm, onCancel }) => {
  if (!config.isOpen) return null;

  return (
    <div className="modal-overlay visible z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-11/12 max-w-sm">
        <h3 className="text-lg font-medium text-gray-800 mb-4">{config.title}</h3>
        <p className="text-sm text-gray-600 mb-6">{config.message}</p>
        <div className="flex justify-end space-x-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700">
            {config.confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
};