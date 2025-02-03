export default function DesktopWarning() {
    return (
      <div className="hidden md:flex fixed inset-0 items-center justify-center bg-white p-6 text-center z-50">
        <p className="text-lg font-semibold text-red-600">
        This app is optimised for mobile. Please use a mobile device or resize your browser to a mobile-friendly size.
        </p>
      </div>
    );
}
  