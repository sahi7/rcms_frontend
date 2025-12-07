// src/features/reports/components/GenerationProgress.tsx
import { StatusResponse } from "../types";

interface Props {
  status: StatusResponse;
  isLoading: boolean;
}

export const GenerationProgress = ({ status, isLoading }: Props) => {
  if (status.status === "completed" && status.download_url) {
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
        <h3 className="text-2xl font-bold text-blue-800 mb-4">Report Cards Ready!</h3>
        <a 
          href={status.download_url}
          className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Download All PDFs (ZIP)
        </a>
      </div>
    );
  }

  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-xl">Generating... {status.progress}</h3>
      <div className="mt-4 bg-gray-200 rounded-full h-4 overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${status.percentage}%` }}
        />
      </div>
      <p className="mt-2 text-sm text-gray-600">{status.message}</p>
    </div>
  );
};