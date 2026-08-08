import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '@/app/AuthProvider';
import {
  ASSESSMENT_QUESTIONS,
  questionsForCategory,
  scoreAssessment,
  AssessmentQuestion,
} from '@/data/assessments';
import { dataService } from '@/services/dataService';
import { Button } from '@/components/ui/Button';
import { TextArea } from '@/components/ui/Input';

type Phase = 'intro' | 'general' | 'situational' | 'role' | 'attitude' | 'score';

export default function AssessmentPage() {
  const { user, proProfile, refresh } = useAuth();
  const navigate = useNavigate();
  const category = proProfile?.category || 'House Help';

  const [phase, setPhase] = useState<Phase>('intro');
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attitude, setAttitude] = useState<Record<string, string>>({ att1: '', att2: '' });
  const [loading, setLoading] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  const general = ASSESSMENT_QUESTIONS.general;
  const situational = ASSESSMENT_QUESTIONS.situational;
  const roleQs = ASSESSMENT_QUESTIONS.role[category] || ASSESSMENT_QUESTIONS.role['House Help'];

  const currentList: AssessmentQuestion[] = useMemo(() => {
    if (phase === 'general') return general;
    if (phase === 'situational') return situational;
    if (phase === 'role') return roleQs;
    return [];
  }, [phase, general, situational, roleQs]);

  const current = currentList[qIndex];
  const phaseProgress =
    phase === 'intro'
      ? 0
      : phase === 'general'
        ? 15 + (qIndex / Math.max(general.length, 1)) * 20
        : phase === 'situational'
          ? 35 + (qIndex / Math.max(situational.length, 1)) * 20
          : phase === 'role'
            ? 55 + (qIndex / Math.max(roleQs.length, 1)) * 25
            : phase === 'attitude'
              ? 85
              : 100;

  const answerCurrent = (value: string) => {
    if (!current) return;
    setAnswers((a) => ({ ...a, [current.id]: value }));
  };

  const nextQuestion = () => {
    if (!current || !answers[current.id]?.trim()) return;
    if (qIndex + 1 < currentList.length) {
      setQIndex(qIndex + 1);
      return;
    }
    if (phase === 'general') {
      setPhase('situational');
      setQIndex(0);
    } else if (phase === 'situational') {
      setPhase('role');
      setQIndex(0);
    } else if (phase === 'role') {
      setPhase('attitude');
      setQIndex(0);
    }
  };

  const finish = async () => {
    if (!user || !proProfile) return;
    if (!attitude.att1.trim() || !attitude.att2.trim()) return;
    setLoading(true);
    try {
      const { scorePercent } = scoreAssessment(category, answers);
      setFinalScore(scorePercent);
      await dataService.submitAssessment(proProfile.id, category, answers, scorePercent, attitude);
      await refresh();
      setPhase('score');
    } catch (e) {
      console.error(e);
      alert('Could not submit assessment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!proProfile) {
    return <div className="py-20 text-center text-slate-400">Loading profile…</div>;
  }

  if (proProfile.assessmentCompletedAt && phase !== 'score') {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-4">
        <CheckCircle2 className="mx-auto text-emerald-500" size={48} />
        <h1 className="text-2xl font-bold">Assessment already submitted</h1>
        <p className="text-slate-500">Score: {proProfile.assessmentScore}%. Your profile is under review.</p>
        <Button onClick={() => navigate('/app')}>Go to dashboard</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#660033] flex items-center gap-2">
            <Sparkles size={14} /> Birdie assessment · {category}
          </p>
          <span className="text-xs font-bold text-slate-400">{Math.round(phaseProgress)}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-[#660033] transition-all duration-500 rounded-full"
            style={{ width: `${phaseProgress}%` }}
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl space-y-6">
        {phase === 'intro' && (
          <div className="space-y-6 text-center">
            <h1 className="text-3xl font-bold text-[#0A0A0A]">Skills assessment</h1>
            <p className="text-[#615A5C] font-medium leading-relaxed">
              This short assessment helps us understand your skills, honesty, and readiness. It takes about 15 minutes.
              Be calm — there are no trick questions.
            </p>
            <p className="text-sm font-bold text-[#660033]">
              {questionsForCategory(category).length} scored questions + 2 attitude prompts
            </p>
            <Button size="lg" className="w-full" onClick={() => setPhase('general')}>
              Start assessment
            </Button>
          </div>
        )}

        {(phase === 'general' || phase === 'situational' || phase === 'role') && current && (
          <div className="space-y-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {phase === 'general' && 'General comprehension'}
              {phase === 'situational' && 'Situational judgment'}
              {phase === 'role' && `${category} questionnaire`} · {qIndex + 1}/{currentList.length}
            </p>
            <h2 className="text-xl md:text-2xl font-bold text-[#0A0A0A] leading-snug">{current.q}</h2>

            {current.type === 'mc' ? (
              <div className="space-y-3">
                {current.a.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => answerCurrent(opt)}
                    className={`w-full text-left p-4 rounded-2xl border-2 font-medium transition-all ${
                      answers[current.id] === opt
                        ? 'border-[#660033] bg-[#660033]/5 text-[#660033]'
                        : 'border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <TextArea
                rows={3}
                value={answers[current.id] || ''}
                onChange={(e) => answerCurrent(e.target.value)}
                placeholder="Type your answer…"
              />
            )}

            <Button className="w-full" size="lg" disabled={!answers[current.id]?.trim()} onClick={nextQuestion}>
              Continue
            </Button>
          </div>
        )}

        {phase === 'attitude' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Attitude & independence</h2>
            <p className="text-sm text-[#615A5C]">These answers are reviewed by Birdie ops (not auto-scored).</p>
            {ASSESSMENT_QUESTIONS.attitude.map((p) => (
              <div key={p.id} className="space-y-2">
                <p className="font-bold text-[#0A0A0A]">{p.q}</p>
                <TextArea
                  rows={4}
                  value={attitude[p.id] || ''}
                  onChange={(e) => setAttitude((a) => ({ ...a, [p.id]: e.target.value }))}
                />
              </div>
            ))}
            <Button
              className="w-full"
              size="lg"
              disabled={!attitude.att1.trim() || !attitude.att2.trim() || loading}
              onClick={finish}
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Submit & see score'}
            </Button>
          </div>
        )}

        {phase === 'score' && (
          <div className="text-center space-y-6 py-6">
            <div className="w-28 h-28 mx-auto rounded-full bg-[#660033]/5 border-4 border-[#660033] flex items-center justify-center">
              <span className="text-3xl font-black text-[#660033]">{finalScore}%</span>
            </div>
            <h2 className="text-3xl font-bold">Assessment complete!</h2>
            <p className="text-[#615A5C] font-medium leading-relaxed">
              Your application is <span className="font-bold text-amber-600">pending verification</span>. Birdie ops will
              review your documents and score. You’ll get an email when you’re approved to receive hires.
            </p>
            <Button size="lg" className="w-full" onClick={() => navigate('/app')}>
              Go to dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
