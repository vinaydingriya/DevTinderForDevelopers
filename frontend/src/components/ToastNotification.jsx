import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeToast } from "../utils/notificationSlice";
import { UserPlus, UserCheck, UserX, MessageCircle, Bell } from "lucide-react";

const ICONS = {
  connection_request: UserPlus,
  request_accepted: UserCheck,
  request_rejected: UserX,
  new_message: MessageCircle,
};

const COLORS = {
  connection_request: "from-purple-500/20 to-indigo-500/20 border-purple-500/30",
  request_accepted: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30",
  request_rejected: "from-red-500/20 to-orange-500/20 border-red-500/30",
  new_message: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
};

const ICON_COLORS = {
  connection_request: "text-purple-400",
  request_accepted: "text-emerald-400",
  request_rejected: "text-red-400",
  new_message: "text-blue-400",
};

const ToastNotification = () => {
  const toasts = useSelector((store) => store.notifications.toasts);
  const dispatch = useDispatch();

  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={() => dispatch(removeToast(toast.id))} />
      ))}
    </div>
  );
};

const Toast = ({ toast, onDismiss }) => {
  const Icon = ICONS[toast.type] || Bell;
  const colorClass = COLORS[toast.type] || "from-slate-500/20 to-slate-600/20 border-slate-500/30";
  const iconColor = ICON_COLORS[toast.type] || "text-slate-400";

  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div
      className={`pointer-events-auto bg-gradient-to-r ${colorClass} backdrop-blur-xl border rounded-2xl p-4 shadow-2xl animate-fade-in-up cursor-pointer`}
      onClick={onDismiss}
    >
      <div className="flex items-start gap-3">
        {/* Avatar or icon */}
        {toast.fromUser?.photoUrl ? (
          <img
            src={toast.fromUser.photoUrl}
            alt=""
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white/10 flex-shrink-0"
          />
        ) : (
          <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white/5 flex-shrink-0 ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white leading-tight">
            {toast.message}
          </p>
          <p className="text-[10px] text-slate-400 mt-1">Just now</p>
        </div>

        {/* Close */}
        <button
          onClick={(e) => { e.stopPropagation(); onDismiss(); }}
          className="text-slate-500 hover:text-white transition-colors flex-shrink-0 mt-0.5"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;
