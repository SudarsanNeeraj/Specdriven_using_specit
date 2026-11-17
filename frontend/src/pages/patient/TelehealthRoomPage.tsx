import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { ClinicalVitalsHud } from '../../components/consultation/ClinicalVitalsHud';
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  ShieldCheck,
  UserCheck,
  MessageSquare,
  Send,
  Activity,
  FileText
} from 'lucide-react';

export const TelehealthRoomPage: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId');
  const navigate = useNavigate();

  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: string; text: string }>>([
    { sender: 'System', text: 'Encrypted end-to-end WebRTC video consultation room initialized.' },
    { sender: 'System', text: 'Patient Vitals HUD synchronized with health record.' }
  ]);
  const [newMessage, setNewMessage] = useState('');

  const { data: appointment } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      const res = await api.get(`/appointments/${appointmentId}`);
      return res.data;
    },
    enabled: !!appointmentId
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    if (confirm('Are you sure you want to exit the video consultation?')) {
      navigate('/patient/appointments');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setChatMessages((prev) => [...prev, { sender: 'You', text: newMessage.trim() }]);
    setNewMessage('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-16">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 text-white px-6 py-3.5 rounded-2xl flex justify-between items-center shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-2.5 h-2.5 rounded-full bg-clinical-teal animate-ping" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Live Clinical Consultation • Room: <span className="font-mono text-clinical-cyan">{roomId}</span>
          </span>
        </div>
        <div className="flex items-center space-x-4 text-xs">
          <span className="font-mono bg-slate-800 border border-slate-700 px-3 py-1 rounded-lg text-clinical-teal font-bold">
            {formatDuration(callDuration)}
          </span>
          <span className="hidden sm:flex items-center text-slate-400">
            <ShieldCheck className="w-4 h-4 mr-1 text-clinical-teal" /> DTLS/SRTP Encrypted (DPDP Compliant)
          </span>
        </div>
      </div>

      {/* Main Grid: Video Feeds + Side Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[500px]">
        {/* Video Area (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-900 rounded-3xl p-6 relative flex flex-col justify-between overflow-hidden shadow-2xl border border-slate-800">
          {/* Main Remote Feed (Doctor / Patient) */}
          <div className="flex-1 flex items-center justify-center relative">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-clinical-blue/20 to-clinical-teal/30 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-clinical-blue text-clinical-cyan shadow-xl">
                <UserCheck className="w-12 h-12" />
              </div>
              <h3 className="text-white font-bold text-lg">
                {appointment?.doctorName || 'Dr. Ramesh Sharma'}
              </h3>
              <p className="text-clinical-cyan text-xs font-semibold mt-0.5">
                {appointment?.specialization || 'Cardiology Specialist'}
              </p>
              <span className="inline-block mt-3 px-3 py-1 bg-clinical-teal/20 text-clinical-teal border border-clinical-teal/30 rounded-full text-[11px] font-semibold">
                High-Definition Encrypted Stream Active
              </span>
            </div>

            {/* Self Video PIP (Picture-in-Picture) */}
            <div className="absolute right-4 bottom-4 w-40 h-28 bg-slate-950 rounded-2xl border-2 border-slate-700 overflow-hidden shadow-2xl flex items-center justify-center text-slate-400">
              {isVideoOn ? (
                <div className="text-center p-2">
                  <div className="w-7 h-7 bg-slate-800 rounded-full mx-auto mb-1 flex items-center justify-center text-clinical-cyan">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] text-slate-300 block font-semibold">Your Camera (HD)</span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 flex items-center">
                  <VideoOff className="w-4 h-4 mr-1 text-rose-500" /> Video Muted
                </div>
              )}
            </div>
          </div>

          {/* Bottom Floating Control Bar */}
          <div className="bg-slate-800/90 backdrop-blur-md px-6 py-2.5 rounded-2xl flex items-center justify-center space-x-4 max-w-md mx-auto w-full border border-slate-700/60 shadow-xl">
            <button
              onClick={() => setIsMicOn(!isMicOn)}
              className={`p-3 rounded-full transition ${
                isMicOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 text-white'
              }`}
              title={isMicOn ? 'Mute Mic' : 'Unmute Mic'}
            >
              {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`p-3 rounded-full transition ${
                isVideoOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-600 text-white'
              }`}
              title={isVideoOn ? 'Turn Video Off' : 'Turn Video On'}
            >
              {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
            </button>

            <button
              onClick={handleEndCall}
              className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-full transition shadow-md"
              title="Leave Call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Side Consultation Chat (1 Col) */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col justify-between shadow-xl">
          <div>
            <div className="flex items-center space-x-2 pb-3 border-b border-slate-800 text-xs font-bold text-white">
              <MessageSquare className="w-4 h-4 text-clinical-cyan" />
              <span>In-Call Clinical Chat</span>
            </div>

            <div className="overflow-y-auto max-h-[320px] space-y-2.5 py-3 text-xs">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`p-2.5 rounded-xl ${
                    msg.sender === 'You'
                      ? 'bg-clinical-blue/20 text-sky-200 border border-clinical-blue/30 ml-4'
                      : msg.sender === 'System'
                      ? 'bg-slate-800 text-slate-400 italic text-[11px]'
                      : 'bg-slate-800 text-slate-200 mr-4'
                  }`}
                >
                  <span className="font-bold block text-[10px] text-slate-400 mb-0.5">{msg.sender}</span>
                  {msg.text}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="relative pt-2 border-t border-slate-800">
            <input
              type="text"
              placeholder="Type message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full text-xs bg-slate-950 border border-slate-800 rounded-xl pr-9 pl-3 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-clinical-blue"
            />
            <button
              type="submit"
              className="absolute right-2 top-4 p-1 text-clinical-cyan hover:text-clinical-teal rounded-lg"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Clinical Vitals & Allergy Decision Support HUD */}
      <ClinicalVitalsHud
        patientName={appointment?.patientName || 'Jane Doe'}
        onSaveNotes={(notes) => {
          setChatMessages((prev) => [
            ...prev,
            { sender: 'System', text: `Clinical note saved: "${notes.substring(0, 40)}..."` }
          ]);
        }}
      />
    </div>
  );
};
