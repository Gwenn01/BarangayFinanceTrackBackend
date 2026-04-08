import { useState } from "react";
import {
  MessageSquare,
  Users,
  Shield,
  Clock,
  CheckCircle2,
} from "lucide-react";
import SectionHeader from "../ui/SectionHeader";
import { submitComment } from "../../../utils/api";
import type { Comment } from "../../../types";

type CommunityFeedbackProps = {
  comments: Comment[] | undefined;
  isLoadingComments: boolean;
  refetchComments: () => void;
};

export default function CommunityFeedback({
  comments,
  isLoadingComments,
  refetchComments,
}: CommunityFeedbackProps) {
  const [commentName, setCommentName] = useState("");
  const [commentEmail, setCommentEmail] = useState("");
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) {
      alert("Please enter a comment");
      return;
    }
    setIsSubmitting(true);
    try {
      await submitComment({
        name: commentName || "Anonymous",
        email: commentEmail,
        comment: commentText,
      });
      alert(
        "Thank you for your feedback! Your comment has been submitted for review.",
      );
      setCommentName("");
      setCommentEmail("");
      setCommentText("");
      refetchComments();
    } catch {
      alert("Failed to submit comment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section>
      <SectionHeader
        title="Community Feedback"
        subtitle="Your voice matters - share your thoughts and suggestions"
        gradientFrom="from-amber-500"
        gradientTo="to-amber-600"
      />

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Comment Form */}
        <div className="glass-card rounded-3xl p-8 shadow-xl border border-amber-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-4 bg-amber-100 rounded-2xl">
              <MessageSquare className="w-7 h-7 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg md:text-2xl font-bold text-slate-900">
                Submit Your Feedback
              </h3>
              <p className="text-xs md:text-sm text-slate-600">
                Help us improve our transparency and services
              </p>
            </div>
          </div>

          <form onSubmit={handleCommentSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Your Name{" "}
                <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <input
                type="text"
                value={commentName}
                onChange={(e) => setCommentName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email{" "}
                <span className="text-slate-400 font-normal">
                  (Optional, for follow-up)
                </span>
              </label>
              <input
                type="email"
                value={commentEmail}
                onChange={(e) => setCommentEmail(e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Your Comment <span className="text-red-500">*</span>
              </label>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={5}
                required
                placeholder="Share your thoughts, questions, or suggestions about our financial transparency..."
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 transition-all duration-200 outline-none text-slate-900 placeholder:text-slate-400 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-lg hover:from-amber-600 hover:to-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Submit Feedback
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 text-center leading-relaxed">
              All comments are reviewed by our admin team. Contact information
              is kept confidential.
            </p>
          </form>
        </div>

        {/* Info Cards */}
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-lg sm:shadow-xl border border-blue-200">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-xl shrink-0">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Why Your Feedback Matters
                </h4>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Your comments help us understand community needs and improve
                  our transparency initiatives. Every piece of feedback is
                  carefully reviewed and considered in our decision-making
                  process.
                </p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-lg sm:shadow-xl border border-emerald-200">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-emerald-100 rounded-xl shrink-0">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Our Commitment
                </h4>
                <ul className="space-y-1 sm:space-y-2 text-sm sm:text-base text-slate-600">
                  {[
                    "All comments reviewed within 3-5 business days",
                    "Respectful and constructive feedback encouraged",
                    "Anonymous submissions welcome",
                    "Privacy and confidentiality guaranteed",
                  ].map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 sm:mt-2" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-3xl p-6 sm:p-8 shadow-lg sm:shadow-xl border border-violet-200">
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="p-3 bg-violet-100 rounded-xl shrink-0">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-violet-600" />
              </div>
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">
                  Response Time
                </h4>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  We strive to acknowledge all feedback promptly. Complex
                  inquiries may require additional time for thorough
                  investigation and response.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments List */}
      <div className="mt-8 sm:mt-12">
        <div className="flex items-center gap-3 mb-4 sm:mb-6">
          <div className="p-2 sm:p-3 bg-blue-100 rounded-xl shrink-0">
            <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900">
              Community Comments
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Recent feedback from our community
            </p>
          </div>
        </div>

        <div className="glass-card rounded-2xl sm:rounded-3xl p-3 sm:p-8 shadow-xl">
          {isLoadingComments ? (
            <div className="flex items-center justify-center py-10 sm:py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <span className="text-slate-500 text-sm">
                  Loading comments...
                </span>
              </div>
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-2.5 sm:space-y-4 text-wrap custom-scrollbar overflow-y-scroll pr-0.5 sm:pr-2 max-h-[450px]">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="p-3 sm:p-6 bg-gradient-to-br from-slate-50 to-white rounded-xl sm:rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 w-full h-auto"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
                    {/* Left: Avatar + Name */}
                    <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-violet-400 flex items-center justify-center text-white font-bold shrink-0 text-xs sm:text-base">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 text-sm sm:text-base truncate leading-tight">
                          {comment.name}
                        </h4>

                        {comment.email && (
                          <p className="text-[11px] sm:text-xs text-slate-400 truncate mt-0.5">
                            {comment.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Created Date */}
                    {comment.created_at && (
                      <div className="text-[10px] sm:text-xs text-slate-400 whitespace-nowrap">
                        {new Date(comment.created_at).toLocaleString()}
                      </div>
                    )}
                  </div>

                  {/* Comment Content */}
                  <p className="text-sm sm:text-base text-slate-700 leading-relaxed break-words">
                    {comment.comment}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12 text-slate-500">
              <MessageSquare className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 text-slate-300" />
              <p className="text-sm sm:text-base">
                No comments yet. Be the first to share your feedback!
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
