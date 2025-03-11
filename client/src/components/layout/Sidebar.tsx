import { useLocation, Link } from "wouter";
import { Utensils, Home, Carrot, Book, ChartBar, Settings } from "lucide-react";

export default function Sidebar() {
  const [location] = useLocation();

  // Navigation items config
  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Carrot, label: "Ingredients", path: "/ingredients" },
    { icon: Book, label: "Recipes", path: "/recipes" },
    { icon: ChartBar, label: "Reports", path: "/reports" },
    { icon: Settings, label: "Settings", path: "/settings" }
  ];

  // Check if a path is active (exact match or starts with path for nested routes)
  const isActivePath = (path: string): boolean => {
    if (path === "/") return location === "/";
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-72 flex-col bg-white border-r border-[#dee2e6] h-screen sticky top-0 shadow-sm">
        <div className="px-6 py-6 border-b border-[#dee2e6]">
          <h1 className="text-2xl font-bold text-aprycot-primary flex items-center">
            <Utensils className="mr-3 text-aprycot-primary" /> Pantry Pro
          </h1>
          <p className="text-sm text-aprycot-body mt-1">Kitchen Inventory Manager</p>
        </div>
        <nav className="flex-1 py-6 px-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-all duration-200 ${
                  isActivePath(item.path)
                    ? "bg-aprycot-primary text-white"
                    : "text-aprycot-heading hover:bg-[#faf9f5] hover:text-aprycot-primary"
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActivePath(item.path) ? "" : "text-aprycot-primary"}`} />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="px-4 py-4 border-t border-[#dee2e6]">
          <div className="flex items-center p-2 rounded-lg hover:bg-[#faf9f5] transition-colors duration-200 cursor-pointer">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-aprycot-primary text-white flex items-center justify-center">
                JC
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-aprycot-heading">User</p>
              <p className="text-xs text-aprycot-body">user@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="bg-white border-b border-[#dee2e6] px-4 py-3 lg:hidden sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-aprycot-primary flex items-center">
            <Utensils className="mr-2 text-aprycot-primary" /> Pantry Pro
          </h1>
          <button
            id="mobile-menu-button"
            className="text-aprycot-heading hover:text-aprycot-primary transition-colors"
            onClick={() => {
              const mobileMenu = document.getElementById("mobile-menu");
              if (mobileMenu) {
                mobileMenu.classList.toggle("hidden");
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <div id="mobile-menu" className="hidden mt-3 pb-3">
          <nav className="space-y-2 rounded-lg overflow-hidden border border-[#dee2e6]">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-4 py-3 text-sm font-medium ${
                  isActivePath(item.path)
                    ? "bg-aprycot-primary text-white"
                    : "text-aprycot-heading hover:bg-[#faf9f5] hover:text-aprycot-primary"
                }`}
              >
                <item.icon className={`w-5 h-5 mr-3 ${isActivePath(item.path) ? "" : "text-aprycot-primary"}`} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
