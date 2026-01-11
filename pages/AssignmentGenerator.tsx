import React from 'react';
import { BaseGenerator } from './BaseGenerator';

const AssignmentGenerator: React.FC = () => {
  return <BaseGenerator type="assignment" title="Assignment Generator" allowFileUpload={true} />;
};

export default AssignmentGenerator;