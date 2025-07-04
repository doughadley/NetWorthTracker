import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const ExclamationTriangleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625l6.28-10.875ZM10 14.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm-1.5-5.25a.75.75 0 0 0-1.5 0v2.5a.75.75 0 0 0 1.5 0v-2.5Z" clipRule="evenodd" />
    </svg>
);
  

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  dataLabel: string;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({ isOpen, onClose, onConfirm, dataLabel }) => {
  const [confirmationText, setConfirmationText] = useState('');

  useEffect(() => {
    if (isOpen) {
      setConfirmationText('');
    }
  }, [isOpen]);

  const canConfirm = confirmationText === 'DELETE';

  const handleSubmit = () => {
    if (canConfirm) {
      onConfirm();
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Permanently Delete ${dataLabel}`}>
      <div className="space-y-4">
        <div className="flex items-start space-x-3 bg-red-50 p-3 rounded-lg border border-red-200">
            <ExclamationTriangleIcon className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
                <h3 className="text-md font-semibold text-red-800">This action is irreversible.</h3>
                <p className="text-sm text-red-700 mt-1">
                    You are about to permanently delete all {dataLabel}. Once deleted, this data cannot be recovered.
                </p>
            </div>
        </div>
        
        <p className="text-sm text-slate-600">
          To confirm, please type <strong className="text-slate-800">DELETE</strong> into the box below.
        </p>
        
        <div>
          <label htmlFor="delete-confirmation" className="sr-only">Type DELETE to confirm</label>
          <input
            id="delete-confirmation"
            type="text"
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-white text-black"
            placeholder="DELETE"
            autoComplete="off"
          />
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-md shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md shadow-sm disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmationModal;
