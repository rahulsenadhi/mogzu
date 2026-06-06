export const MARKETING_COLORS = {
  navy: '#0e1e3f',
  cream: '#FFFDF9',
  mint: '#15D39D',
  pink: '#EE2A7B',
  yellow: '#FFD100',
  orange: '#FF5E00',
  purple: '#9B51E0',
  black: '#111827',
} as const

export const MARKETING_PAGE_SHELL =
  "min-h-screen bg-[#FFFDF9] font-['Plus_Jakarta_Sans',_sans-serif] selection:bg-[#EE2A7B]/30 selection:text-[#0e1e3f] overflow-x-hidden"

export const CHUNKY_STYLES_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  
  .border-3 { border-width: 3px; }
  
  .btn-chunky {
    border: 3px solid #111827;
    box-shadow: 4px 4px 0px 0px #111827;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .btn-chunky:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0px 0px #111827;
  }
  .btn-chunky:active {
    transform: translate(4px, 4px);
    box-shadow: 0px 0px 0px 0px #111827;
  }
  
  .card-chunky {
    border: 3px solid #111827;
    box-shadow: 8px 8px 0px 0px #111827;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .card-chunky:hover {
    transform: translate(-4px, -4px);
    box-shadow: 12px 12px 0px 0px #111827;
  }

  .input-chunky {
    border: 3px solid #111827;
    box-shadow: inset 4px 4px 0px 0px rgba(0,0,0,0.05);
  }
  .input-chunky:focus {
    outline: none;
    box-shadow: inset 4px 4px 0px 0px rgba(0,0,0,0.1);
    border-color: #EE2A7B;
  }
`
