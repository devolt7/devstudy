import React from 'react';
import { BaseGenerator } from './BaseGenerator';

const HomeworkGenerator: React.FC = () => {
  return <BaseGenerator type="assignment" title="Homework Solver" allowFileUpload={false} />;
};

export default HomeworkGenerator;