// Consistent empty / error placeholder. Pass a lucide icon component as `icon`.
export default function EmptyState({ icon: Icon, title, children, action, role }) {
  return (
    <div className="empty" role={role}>
      {Icon && (
        <div className="empty-icon">
          <Icon aria-hidden="true" />
        </div>
      )}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </div>
  );
}
