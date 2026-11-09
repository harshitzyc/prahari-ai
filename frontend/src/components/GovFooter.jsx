export default function GovFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 px-6 mt-auto border-t-4 border-indigo-700">
      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-8 text-xs">
        <div>
          <h4 className="font-bold text-white mb-2">PRAHARI · SIH 2026</h4>
          <p className="mb-2">AI-powered oversight for MPLADS. Built by Team HexaCore.</p>
          <p className="text-slate-500">© 2026 Ministry of Statistics & Programme Implementation, Govt. of India.</p>
        </div>
        <div>
          <h4 className="font-bold text-white mb-2">Quick Links</h4>
          <ul className="space-y-1">
            <li className="hover:text-white cursor-pointer">MPLADS Guidelines</li>
            <li className="hover:text-white cursor-pointer">eSAKSHI Portal</li>
            <li className="hover:text-white cursor-pointer">MoSPI Annual Report</li>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-white mb-2">Policies</h4>
          <ul className="space-y-1">
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
            <li className="hover:text-white cursor-pointer">Terms of Use</li>
            <li className="hover:text-white cursor-pointer">Website Policies</li>
            <li className="hover:text-white cursor-pointer">Copyright Policy</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}