import LogoText from "./LogoText";

const Header = () => {
  return (
    <header className="w-full bg-[#004B2A] fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-start">
        {/* Logo */}
        <LogoText variant="white" linkTo="/" />
      </div>
    </header>
  );
};

export default Header;