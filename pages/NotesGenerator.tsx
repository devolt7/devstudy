import React from 'react';
import { BaseGenerator } from './BaseGenerator';

const NotesGenerator: React.FC = () => {
  return <BaseGenerator type="notes" title="Notes Generator" allowFileUpload={true} />;
};

export default NotesGenerator;