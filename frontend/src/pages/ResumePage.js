import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Upload, FileText, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';

const ResumePage = () => {
  const { API } = useContext(AuthContext);
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await axios.get(`${API}/resume`);
      setResumes(response.data);
      if (response.data.length > 0 && !selectedResume) {
        setSelectedResume(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    if (!file.name.endsWith('.pdf') && !file.name.endsWith('.docx')) {
      toast.error('Only PDF and DOCX files are supported');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/resume/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Resume parsed successfully!');
      await fetchResumes();
      setSelectedResume(response.data);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const renderJSON = (obj, level = 0) => {
    if (typeof obj !== 'object' || obj === null) {
      return <span className="json-string">{JSON.stringify(obj)}</span>;
    }

    return (
      <div style={{ marginLeft: level * 20 }}>
        {Array.isArray(obj) ? (
          <div>
            {obj.map((item, index) => (
              <div key={index} className="mb-2">
                <span className="json-key">[{index}]:</span>
                {renderJSON(item, level + 1)}
              </div>
            ))}
          </div>
        ) : (
          <div>
            {Object.entries(obj).map(([key, value]) => (
              <div key={key} className="mb-2">
                <span className="json-key">{key}:</span>{' '}
                {typeof value === 'object' ? renderJSON(value, level + 1) : <span className="json-string">{JSON.stringify(value)}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8" data-testid="resume-page">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Resume Parser</h1>
        <p className="text-slate-600">Upload your resume and extract structured data</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Upload Resume</CardTitle>
            <CardDescription>Drag and drop or click to upload (PDF or DOCX)</CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              whileHover={{ scale: 1.01 }}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50'
                  : 'border-slate-300 hover:border-indigo-400'
              }`}
              data-testid="resume-upload-zone"
            >
              {uploading ? (
                <div className="space-y-3">
                  <Loader2 className="w-12 h-12 mx-auto animate-spin text-indigo-600" />
                  <p className="text-slate-600">Parsing your resume...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 mx-auto text-slate-400" />
                  <div>
                    <p className="text-slate-700 font-medium mb-1">Drop your resume here</p>
                    <p className="text-sm text-slate-500">or</p>
                  </div>
                  <Button
                    onClick={() => document.getElementById('file-input').click()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30"
                    data-testid="resume-upload-button"
                  >
                    Browse Files
                  </Button>
                  <input
                    id="file-input"
                    type="file"
                    accept=".pdf,.docx"
                    onChange={(e) => handleFileUpload(e.target.files[0])}
                    className="hidden"
                    data-testid="resume-file-input"
                  />
                </div>
              )}
            </motion.div>

            {/* Resume List */}
            {resumes.length > 0 && (
              <div className="mt-6 space-y-2">
                <h3 className="font-semibold text-slate-900 mb-3">Your Resumes</h3>
                {resumes.map((resume) => (
                  <button
                    key={resume.id}
                    onClick={() => setSelectedResume(resume)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      selectedResume?.id === resume.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                    }`}
                    data-testid={`resume-item-${resume.id}`}
                  >
                    <FileText className="w-5 h-5 text-indigo-600" />
                    <div className="flex-1 text-left">
                      <p className="font-medium text-slate-900">{resume.filename}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(resume.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    {selectedResume?.id === resume.id && (
                      <CheckCircle className="w-5 h-5 text-indigo-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Parsed Data Display */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle>Parsed Data</CardTitle>
            <CardDescription>Structured information extracted from your resume</CardDescription>
          </CardHeader>
          <CardContent>
            {selectedResume ? (
              <div className="json-viewer max-h-[600px] overflow-y-auto" data-testid="parsed-resume-data">
                {renderJSON(selectedResume.parsed_data)}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p>Upload a resume to see parsed data</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResumePage;
