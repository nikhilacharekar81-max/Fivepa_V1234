import React, { useState } from 'react';
import { ChevronLeft, CheckCircle2, Clock, RotateCcw, ShieldCheck, AlertCircle } from 'lucide-react';
import { WorkstreamItem } from './types';
import { UserAccount } from '../../types';
import { WorkstreamSummaryCard } from './WorkstreamSummaryCard';
import { WorkstreamActionsPanel } from './WorkstreamActionsPanel';
import { WorkstreamReleaseModal } from './WorkstreamReleaseModal';
import { WorkstreamDeliverModal } from './WorkstreamDeliverModal';
import { WorkstreamRevisionModal } from './WorkstreamRevisionModal';
import { WorkstreamReviewModal } from './WorkstreamReviewModal';
import { WorkstreamVideoCallModal } from './WorkstreamVideoCallModal';
import { WorkstreamActivityStream } from './WorkstreamActivityStream';
import { WorkstreamMessageInput } from './WorkstreamMessageInput';
import { WorkstreamFilesTab } from './WorkstreamFilesTab';
import { useWorkstreamOffers } from '../../hooks/workstream/useWorkstreamOffers';

interface WorkstreamWorkspaceProps {
  order: WorkstreamItem;
  partner?: UserAccount;
  currentUser: UserAccount;
  messages: any[];
  files: any[];
  onBack: () => void;
  onSendMessage: (text: string) => void;
  onAttachFile: (file: { name: string; size: string; url: string }) => void;
  /** Called after a buyer accepts / pays an offer so the parent can refresh its order list. */
  onOrderChanged?: (order: any, newOrder?: any) => void;
  onReleaseEscrow: () => void | Promise<boolean>;
  onDeliverWork: (delivery: { notes: string; files: Array<{ name: string; size: string; url: string }> }) => void;
  onRequestRevision: (reason: string) => void;
  handleSubmitReview: (review: { rating: number; comment: string; gigId?: string; projectId?: string }) => Promise<boolean>;
  onViewPartnerProfile: () => void;
  onDisputeAssistance: () => void;
  handleLogRequirement: (req: string) => void;
  handleMissedCall: () => void;
  usersList: UserAccount[];
  errorInfo?: { msg: string; retryAction: () => void } | null;
  setErrorInfo: (e: any) => void;
  reviewError?: string;
  isSubmittingReview: boolean;
  isReviewModalOpen: boolean;
  setIsReviewModalOpen: (open: boolean) => void;
}

export const WorkstreamWorkspace: React.FC<WorkstreamWorkspaceProps> = ({
  order,
  partner,
  currentUser,
  messages,
  files,
  onBack,
  onSendMessage,
  onAttachFile,
  onOrderChanged,
  onReleaseEscrow,
  onDeliverWork,
  onRequestRevision,
  handleSubmitReview,
  onViewPartnerProfile,
  onDisputeAssistance,
  handleLogRequirement,
  handleMissedCall,
  usersList,
  errorInfo,
  setErrorInfo,
  reviewError,
  isSubmittingReview,
  isReviewModalOpen,
  setIsReviewModalOpen
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'activity' | 'files'>('activity');
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [isDeliverModalOpen, setIsDeliverModalOpen] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isVideoCallModalOpen, setIsVideoCallModalOpen] = useState(false);

  // Real proposals / invoices / deposit requests for this workstream (server is the source of truth)
  const lastMessageId = messages.length ? messages[messages.length - 1].id : '';
  const { offers, currencySymbol, escrowFunded, createOffer, respond } = useWorkstreamOffers(order.id, lastMessageId);
  const isSeller = !!currentUser && currentUser.id === order.sellerId;
  const canSendProposal = isSeller && !escrowFunded && order.status === 'in_progress';
  const canRaiseInvoice = isSeller && escrowFunded && order.status !== 'cancelled';
  const proposalHint = !isSeller ? 'Only the seller can send this' : 'Escrow is already funded. Use Raise Invoice for extra work.';
  const invoiceHint = !isSeller ? 'Only the seller can send this' : 'Invoices are for follow-on work once escrow is funded.';

  const handleOfferAction = async (offerId: string, action: 'accept' | 'decline' | 'cancel') => {
    const result = await respond(offerId, action);
    if (result.ok && (result.order || result.newOrder)) onOrderChanged?.(result.order, result.newOrder);
    return result;
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'completed':
        return (
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold uppercase rounded-full flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold uppercase rounded-full flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Delivered · Awaiting Review</span>
          </span>
        );
      case 'revision':
        return (
          <span className="px-3 py-1 bg-purple-50 text-purple-800 border border-purple-200 text-[10px] font-bold uppercase rounded-full flex items-center gap-1.5">
            <RotateCcw className="w-3.5 h-3.5 text-purple-600" />
            <span>Revision in Progress</span>
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-bold uppercase rounded-full flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Escrow Protected (${order.amount})</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {errorInfo && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">{errorInfo.msg}</span>
          </div>
          <button 
            onClick={() => { errorInfo.retryAction(); setErrorInfo(null); }}
            className="px-3 py-1 bg-rose-200 hover:bg-rose-300 text-rose-900 rounded-lg font-bold transition cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* WORKSTREAM HEADER */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors cursor-pointer"
              title="Back to All Workstreams"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-bold text-fiverr-dark tracking-tight">
                  {order.title}
                </h1>
                {getStatusBadge()}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Order #{order.id} • Partner: <strong className="text-fiverr-dark font-medium">{partner?.name || 'Collaborator'}</strong>
              </p>
            </div>
          </div>
        </div>

        {/* WORKSTREAM BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-6">
          {/* LEFT COLUMN: ACTIVITY / FILES */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl flex flex-col h-[500px]">
            <div className="border-b border-slate-200 flex items-center">
              <button onClick={() => setActiveSubTab('activity')} className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${activeSubTab === 'activity' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-fiverr-dark'}`}>Activity</button>
              <button onClick={() => setActiveSubTab('files')} className={`px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition ${activeSubTab === 'files' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-fiverr-dark'}`}>Files</button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {activeSubTab === 'activity' ? (
                <>
                  <WorkstreamActivityStream
                    key={order.id}
                    messages={messages}
                    currentUserId={currentUser.id}
                    usersList={usersList}
                    partnerUser={partner}
                    onDownloadFile={onAttachFile}
                    offers={offers}
                    buyerId={order.buyerId}
                    sellerId={order.sellerId}
                    onOfferAction={handleOfferAction}
                  />
                  <WorkstreamMessageInput
                    key={order.id}
                    onSendMessage={onSendMessage}
                    onAttachFile={onAttachFile}
                    onStartVideoCall={() => setIsVideoCallModalOpen(true)}
                    onCreateOffer={createOffer}
                    canSendProposal={canSendProposal}
                    canRaiseInvoice={canRaiseInvoice}
                    proposalHint={proposalHint}
                    invoiceHint={invoiceHint}
                    currencySymbol={currencySymbol}
                  />
                </>
              ) : (
                <WorkstreamFilesTab
                  key={`files_${order.id}`}
                  files={files}
                  onUploadFile={onAttachFile}
                  onDownloadFile={onAttachFile}
                />
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: SUMMARY CARD & ACTIONS PANEL */}
          <div className="space-y-6">
            <WorkstreamSummaryCard
              order={order}
              partner={partner}
              currentUser={currentUser}
              onViewPartnerProfile={onViewPartnerProfile}
            />
            <WorkstreamActionsPanel
              order={order}
              currentUser={currentUser}
              onOpenReleaseModal={() => setIsReleaseModalOpen(true)}
              onOpenDeliverModal={() => setIsDeliverModalOpen(true)}
              onOpenRevisionModal={() => setIsRevisionModalOpen(true)}
              onOpenReviewModal={() => setIsReviewModalOpen(true)}
              onStartVideoCall={() => setIsVideoCallModalOpen(true)}
              onAttachFiles={() => setActiveSubTab('files')}
              onDisputeAssistance={onDisputeAssistance}
            />
          </div>
        </div>
      </div>

      {/* MODALS */}
      <WorkstreamVideoCallModal
        key={`video_${order.id}`}
        isOpen={isVideoCallModalOpen}
        order={order}
        currentUser={currentUser}
        partner={partner}
        onClose={() => setIsVideoCallModalOpen(false)}
        onLogRequirement={handleLogRequirement}
        onMissedCall={handleMissedCall}
      />
      <WorkstreamReleaseModal
        key={`release_${order.id}`}
        isOpen={isReleaseModalOpen}
        order={order}
        onClose={() => setIsReleaseModalOpen(false)}
        onConfirm={async () => { await onReleaseEscrow(); }}
      />
      <WorkstreamDeliverModal
        key={`deliver_${order.id}`}
        isOpen={isDeliverModalOpen}
        order={order}
        onClose={() => setIsDeliverModalOpen(false)}
        onSubmitDelivery={onDeliverWork}
      />
      <WorkstreamRevisionModal
        key={`revision_${order.id}`}
        isOpen={isRevisionModalOpen}
        order={order}
        onClose={() => setIsRevisionModalOpen(false)}
        onSubmitRevision={onRequestRevision}
      />
      <WorkstreamReviewModal
        key={`review_${order.id}`}
        isOpen={isReviewModalOpen}
        order={order}
        onClose={() => setIsReviewModalOpen(false)}
        onSubmitReview={handleSubmitReview}
        error={reviewError}
        isSubmitting={isSubmittingReview}
      />
    </div>
  );
};
