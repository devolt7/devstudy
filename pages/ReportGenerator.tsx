import React from 'react';
import { BaseGenerator } from './BaseGenerator';

const ReportGenerator: React.FC = () => {
  return <BaseGenerator type="report" title="Article Generator" allowFileUpload={false} />;
};

export default ReportGenerator;