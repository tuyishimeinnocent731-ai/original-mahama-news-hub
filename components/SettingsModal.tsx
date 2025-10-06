import React from 'react';
import Modal from './Modal';
import SettingsPage from '../pages/SettingsPage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="max-h-[80vh] w-[90vw] max-w-4xl overflow-y-auto -m-6">
        <SettingsPage />
      </div>
    </Modal>
  );
};

export default SettingsModal;
