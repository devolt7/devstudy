import React from 'react';
import { BaseGenerator } from './BaseGenerator';

const VivaGenerator: React.FC = () => {
  return <BaseGenerator type="viva" title="Viva Voce Preparation" allowFileUpload={true} />;
};

export default VivaGenerator;