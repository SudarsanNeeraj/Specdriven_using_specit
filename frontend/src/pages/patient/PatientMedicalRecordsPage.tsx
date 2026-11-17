import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { MedicalRecord } from '../../types';
import { FileText, Upload, Plus, Download, Calendar, Loader2 } from 'lucide-react';

export const PatientMedicalRecordsPage: React.FC = () => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [recordType, setRecordType] = useState('LAB_REPORT');
  const [fileName, setFileName] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: records = [], isLoading, refetch } = useQuery<MedicalRecord[]>({
    queryKey: ['my-medical-records'],
    queryFn: async () => {
      const res = await api.get('/my-records');
      return res.data;
    }
  });

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/appointments/general/records', {
        recordType,
        fileName: fileName || 'Lab_Report.pdf',
        notes
      });
      alert('Medical document attached successfully.');
      setShowUploadModal(false);
      setFileName('');
      setNotes('');
      refetch();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Medical Records & Prescriptions</h1>
          <p className="text-xs text-slate-500">Securely store and share lab reports, imaging, and digital prescriptions.</p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center"
        >
          <Upload className="w-4 h-4 mr-1.5" />
          Upload Record / Report
        </button>
      </div>

      {isLoading ? (
        <div className="p-16 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto mb-2" />
          <span className="text-xs">Loading medical files...</span>
        </div>
      ) : records.length === 0 ? (
        <div className="p-16 text-center bg-white border border-slate-200 rounded-2xl">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">No medical records uploaded</h3>
          <p className="text-xs text-slate-500 mb-4">You have not uploaded any lab reports or received digital prescriptions yet.</p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-lg text-xs font-semibold"
          >
            Upload your first report
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((rec) => (
            <div key={rec.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-brand-50 text-brand-600 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-700">
                    {rec.recordType.replace('_', ' ')}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 truncate mb-1">{rec.fileName}</h3>
                {rec.notes && <p className="text-xs text-slate-500 mb-3 line-clamp-2">{rec.notes}</p>}
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-[11px] text-slate-400">
                  {new Date(rec.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                <span className="text-brand-600 font-semibold cursor-pointer hover:underline flex items-center">
                  <Download className="w-3.5 h-3.5 mr-1" /> View / Download
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl relative border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center">
              <Upload className="w-5 h-5 mr-2 text-brand-600" /> Upload Health Record
            </h3>
            <p className="text-xs text-slate-500 mb-4">Attach lab tests, blood reports, or prescription scans.</p>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Record Type</label>
                <select
                  value={recordType}
                  onChange={(e) => setRecordType(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                >
                  <option value="LAB_REPORT">Lab & Diagnostic Report</option>
                  <option value="PRESCRIPTION">Past Prescription</option>
                  <option value="DIAGNOSTIC_IMAGE">X-Ray / MRI / Scan</option>
                  <option value="VISIT_SUMMARY">Discharge / Visit Summary</option>
                  <option value="OTHER">Other Clinical Document</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title / File Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete_Blood_Count_Nov2026.pdf"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Clinical Notes (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Doctor recommendation, fasting blood sugar 98 mg/dL..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

