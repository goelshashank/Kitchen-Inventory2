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
      <aside className="hidden lg:flex lg:w-64 flex-col bg-white border-r border-slate-200 h-screen sticky top-0">
        <div className="px-6 py-4 border-b border-slate-200">
          <h1 className="text-2xl font-bold text-primary flex items-center">
            <Utensils className="mr-2" /> Pantry
          </h1>
          <p className="text-sm text-slate-500">Kitchen Inventory Manager</p>
        </div>
        <nav className="flex-1 py-4 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActivePath(item.path)
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
        <div className="px-3 py-3 border-t border-slate-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center">
                JC
              </div>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">User</p>
              <p className="text-xs text-slate-500">user@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 lg:hidden sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-primary flex items-center">
            <Utensils className="mr-2" /> Pantry
          </h1>
          <button
            id="mobile-menu-button"
            className="text-slate-600"
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
        <div id="mobile-menu" className="hidden mt-2 pb-2">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                  isActivePath(item.path)
                    ? "bg-primary text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <item.icon className="w-5 h-5 mr-2" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
