import React from 'react';
import { Loader2 } from 'lucide-react';
const Button = ({ children, variant = 'primary', size = 'md', isLoading = false, disabled = false, className = '', ...props }) => {
  const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = { primary: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/20 focus:ring-emerald-500", secondary: "bg-slate-700 hover:bg-slate-600 text-slate-100 border border-slate-600 focus:ring-slate-500", danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20 focus:ring-red-500", ghost: "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white", outline: "bg-transparent border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-white" };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (<button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} disabled={disabled || isLoading} {...props}>{isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{children}</button>);
};
export default Button;
