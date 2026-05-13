import clsx from "clsx";
import svgPaths from "./svg-xc2md8ezr7";
import imgAvatar from "figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png";
import imgImage24877 from "figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png";
type Wrapper11Props = {
  additionalClassNames?: string;
};

function Wrapper11({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper11Props>) {
  return (
    <div style={{ "--transform-inner-width": "1185", "--transform-inner-height": "21" } as React.CSSProperties} className={clsx("absolute flex items-center justify-center left-[54px] w-0", additionalClassNames)}>
      <div className="-rotate-90 flex-none">{children}</div>
    </div>
  );
}
type TopNavHelperProps = {
  additionalClassNames?: string;
};

function TopNavHelper({ children, additionalClassNames = "" }: React.PropsWithChildren<TopNavHelperProps>) {
  return (
    <div className={clsx("size-[32px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        {children}
      </svg>
    </div>
  );
}
type Wrapper10Props = {
  additionalClassNames?: string;
};

function Wrapper10({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper10Props>) {
  return (
    <div className={additionalClassNames}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12 12">
        {children}
      </svg>
    </div>
  );
}
type Wrapper9Props = {
  additionalClassNames?: string;
};

function Wrapper9({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper9Props>) {
  return <Wrapper10 additionalClassNames={clsx("absolute size-[12px] top-[2px]", additionalClassNames)}>{children}</Wrapper10>;
}

function Wrapper8({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute h-[45.5px] left-[1112px] top-[18.5px] w-[356px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 356 45.5">
        {children}
      </svg>
    </div>
  );
}
type Wrapper7Props = {
  additionalClassNames?: string;
};

function Wrapper7({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper7Props>) {
  return (
    <div className={clsx("relative shrink-0 size-[28px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        {children}
      </svg>
    </div>
  );
}
type Wrapper6Props = {
  additionalClassNames?: string;
};

function Wrapper6({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper6Props>) {
  return (
    <div className={additionalClassNames}>
      <div className="absolute inset-[34.38%_15.62%_28.12%_15.63%]" data-name="Vector">
        {children}
      </div>
    </div>
  );
}
type Wrapper5Props = {
  additionalClassNames?: string;
};

function Wrapper5({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper5Props>) {
  return (
    <div className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="overflow-clip relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border-[#cbd5e1] border-b border-solid inset-0 pointer-events-none" />
    </div>
  );
}

function Wrapper4({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 w-full">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-start pb-[24px] px-[32px] relative w-full">{children}</div>
      </div>
    </div>
  );
}

function Wrapper3({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper5 additionalClassNames="h-[59px] w-full">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium h-[27px] leading-[28px] left-[24px] not-italic text-[#0e1e3f] text-[20px] top-[20px] w-[167px]">{children}</p>
      <div className="absolute flex items-center justify-center left-[1694px] size-[28px] top-[20px]">
        <div className="-scale-y-100 flex-none">
          <Wrapper6 additionalClassNames="overflow-clip relative size-[28px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 19.251 10.5012">
              <path d={svgPaths.p2e35f1c0} fill="var(--fill-0, #0E1E3F)" id="Vector" />
            </svg>
          </Wrapper6>
        </div>
      </div>
    </Wrapper5>
  );
}
type Frame1973341981CaretDownProps = {
  additionalClassNames?: string;
};

function Frame1973341981CaretDown({ children, additionalClassNames = "" }: React.PropsWithChildren<Frame1973341981CaretDownProps>) {
  return (
    <Wrapper6 additionalClassNames={clsx("overflow-clip size-[24px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.5008 9.00101">
        {children}
      </svg>
    </Wrapper6>
  );
}
type TextProps = {
  text: string;
  additionalClassNames?: string;
};

function Text({ text, children, additionalClassNames = "" }: React.PropsWithChildren<TextProps>) {
  return (
    <div className={clsx("absolute content-stretch flex gap-[4px] items-center overflow-clip px-[6px] py-[2px] top-[18px]", additionalClassNames)}>
      <div className="relative shrink-0 size-[20px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          {children}
        </svg>
      </div>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#475569] text-[16px] text-center whitespace-nowrap">{text}</p>
    </div>
  );
}
type CorportateMenuFrame1Props = {
  additionalClassNames?: string;
};

function CorportateMenuFrame1({ children, additionalClassNames = "" }: React.PropsWithChildren<CorportateMenuFrame1Props>) {
  return (
    <div className={clsx("size-[24px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        <g id="Frame">{children}</g>
      </svg>
    </div>
  );
}

function CorportateMenuFrame({ children }: React.PropsWithChildren<{}>) {
  return (
    <Wrapper7>
      <g id="Frame">{children}</g>
    </Wrapper7>
  );
}
type Wrapper2Props = {
  additionalClassNames?: string;
};

function Wrapper2({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper2Props>) {
  return (
    <div className={additionalClassNames}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
        <g id="Frame">{children}</g>
      </svg>
    </div>
  );
}
type Wrapper1Props = {
  additionalClassNames?: string;
};

function Wrapper1({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper1Props>) {
  return <Wrapper2 additionalClassNames={clsx("size-[18px]", additionalClassNames)}>{children}</Wrapper2>;
}

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="absolute h-[38.031px] left-[163px] top-[89px] w-[76px]">
      <div className="absolute inset-[-2.64%_0_-1.52%_-1.07%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 76.8599 39.6108">
          <g id="Group 1000004842">{children}</g>
        </svg>
      </div>
    </div>
  );
}
type Helper3Props = {
  text: string;
  text1: string;
  text2: string;
  additionalClassNames?: string;
};

function Helper3({ text, text1, text2, additionalClassNames = "" }: Helper3Props) {
  return (
    <Wrapper5 additionalClassNames="h-[79px] w-full">
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[24px] not-italic text-[#0e1e3f] text-[20px] top-[calc(50%-13.5px)] whitespace-nowrap">{text}</p>
      <div className="absolute contents left-[1111px] top-[7px]">
        <div className="absolute h-[53.5px] left-[1112px] top-[10.5px] w-[356px]">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 356 53.5">
            <path d={svgPaths.p2a7420c0} fill="var(--fill-0, #2563EB)" fillOpacity="0.1" id="Vector 375" />
          </svg>
        </div>
        <div className="absolute h-[39px] left-[1112px] top-[9.5px] w-[355px]">
          <div className="absolute inset-[-2.65%_0_-2.71%_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 355.694 41.0914">
              <path d={svgPaths.p5aed848} id="Vector 376" stroke="var(--stroke-0, #2563EB)" strokeWidth="2" />
            </svg>
          </div>
        </div>
        <Helper1 additionalClassNames="left-[1111px] top-[40px]" />
        <Helper1 additionalClassNames="left-[1199px] top-[7px]" />
        <Helper1 additionalClassNames="left-[1287px] top-[23px]" />
        <Helper1 additionalClassNames="left-[1352px] top-[46px]" />
        <Helper1 additionalClassNames="left-[1418px] top-[22px]" />
        <Helper1 additionalClassNames="left-[1464px] top-[40px]" />
      </div>
      <p className="-translate-x-full absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[1590px] not-italic text-[16px] text-black text-right top-[30px] whitespace-nowrap">{text1}</p>
      <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[1631px] not-italic text-[#ef4444] text-[14px] text-center top-[32px] whitespace-nowrap">{text2}</p>
      <div className="absolute flex items-center justify-center left-[1662px] size-[18px] top-[32px]">
        <div className="-scale-y-100 flex-none">
          <Frame1 additionalClassNames="relative" />
        </div>
      </div>
    </Wrapper5>
  );
}
type Helper2Props = {
  additionalClassNames?: string;
};

function Helper2({ additionalClassNames = "" }: Helper2Props) {
  return (
    <div className="absolute contents left-[1111px] top-[16px]">
      <Wrapper8>
        <path d={svgPaths.p385a0100} fill="var(--fill-0, #2563EB)" fillOpacity="0.1" id="Vector 375" />
      </Wrapper8>
      <div className="absolute h-[30px] left-[1112px] top-[18.5px] w-[356px]">
        <div className="absolute inset-[-2.96%_-0.13%_-3.38%_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 356.506 31.9009">
            <path d={svgPaths.p24acde00} id="Vector 376" stroke="var(--stroke-0, #2563EB)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <Helper1 additionalClassNames="left-[1111px] top-[40px]" />
      <Helper1 additionalClassNames="left-[1199px] top-[43px]" />
      <Helper1 additionalClassNames="left-[1287px] top-[23px]" />
      <Helper1 additionalClassNames="left-[1352px] top-[46px]" />
      <Helper1 additionalClassNames="left-[1418px] top-[40px]" />
      <Helper1 additionalClassNames="left-[1464px] top-[16px]" />
    </div>
  );
}
type Helper1Props = {
  additionalClassNames?: string;
};

function Helper1({ additionalClassNames = "" }: Helper1Props) {
  return (
    <div className={clsx("absolute size-[6px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 6">
        <circle cx="3" cy="3" fill="var(--fill-0, #2563EB)" id="Ellipse 3384" r="3" />
      </svg>
    </div>
  );
}

function Helper() {
  return (
    <div className="absolute contents left-[1111px] top-[15px]">
      <Wrapper8>
        <path d={svgPaths.p24049800} fill="var(--fill-0, #2563EB)" fillOpacity="0.1" id="Vector 375" />
      </Wrapper8>
      <div className="absolute h-[24.5px] left-[1112px] top-[18.5px] w-[356px]">
        <div className="absolute inset-[-4.17%_-0.13%_-4.5%_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 356.728 26.6236">
            <path d={svgPaths.p37441070} id="Vector 376" stroke="var(--stroke-0, #2563EB)" strokeWidth="2" />
          </svg>
        </div>
      </div>
      <Helper1 additionalClassNames="left-[1111px] top-[40px]" />
      <Helper1 additionalClassNames="left-[1198px] top-[15px]" />
      <Helper1 additionalClassNames="left-[1284px] top-[23px]" />
      <Helper1 additionalClassNames="left-[1359px] top-[15px]" />
      <Helper1 additionalClassNames="left-[1418px] top-[40px]" />
      <Helper1 additionalClassNames="left-[1464px] top-[16px]" />
    </div>
  );
}
type InfoProps = {
  additionalClassNames?: string;
};

function Info({ additionalClassNames = "" }: InfoProps) {
  return (
    <Wrapper10 additionalClassNames={clsx("absolute size-[12px] top-[140px]", additionalClassNames)}>
      <g clipPath="url(#clip0_246_2079)" id="Info">
        <g id="Vector" />
        <path d={svgPaths.p19792100} id="Vector_2" stroke="var(--stroke-0, #5C5D99)" strokeLinecap="round" strokeLinejoin="round" />
        <path d={svgPaths.p3431a280} id="Vector_3" stroke="var(--stroke-0, #5C5D99)" strokeLinecap="round" strokeLinejoin="round" />
        <path d={svgPaths.p200155f0} fill="var(--fill-0, #5C5D99)" id="Vector_4" />
      </g>
      <defs>
        <clipPath id="clip0_246_2079">
          <rect fill="white" height="12" width="12" />
        </clipPath>
      </defs>
    </Wrapper10>
  );
}
type Frame1Props = {
  additionalClassNames?: string;
};

function Frame1({ additionalClassNames = "" }: Frame1Props) {
  return (
    <Wrapper1 additionalClassNames={additionalClassNames}>
      <path d={svgPaths.p974300} fill="var(--fill-0, #EF4444)" id="Vector" />
    </Wrapper1>
  );
}
type FrameProps = {
  additionalClassNames?: string;
};

function Frame({ additionalClassNames = "" }: FrameProps) {
  return (
    <Wrapper2 additionalClassNames={clsx("absolute size-[18px]", additionalClassNames)}>
      <path d={svgPaths.p974300} fill="var(--fill-0, #22C55E)" id="Vector" />
    </Wrapper2>
  );
}
type TopNavProps = {
  className?: string;
  property1?: "Default" | "Variant2";
};

function TopNav({ className, property1 = "Default" }: TopNavProps) {
  const isVariant2 = property1 === "Variant2";
  return (
    <div className={className || `bg-white h-[80px] relative ${isVariant2 ? "w-[1811px]" : "w-[1655px]"}`}>
      <div aria-hidden="true" className="absolute border-[#ececec] border-b-2 border-solid inset-0 pointer-events-none" />
      <div className="absolute content-stretch flex items-start justify-end left-[1272px] top-[22px]" />
      <div className={`-translate-x-1/2 -translate-y-1/2 absolute content-stretch flex gap-[24px] items-center justify-end top-1/2 ${isVariant2 ? "left-[calc(50%+733px)]" : "left-[calc(50%+655px)]"}`}>
        <TopNavHelper additionalClassNames="relative shrink-0">
          <g clipPath="url(#clip0_246_2258)" id="question (1) 1">
            <g id="Vector" />
            <path d={svgPaths.pb23fa80} id="Vector_2" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p1f657d00} fill="var(--fill-0, #959595)" id="Vector_3" />
            <path d={svgPaths.p2714a900} id="Vector_4" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
          <defs>
            <clipPath id="clip0_246_2258">
              <rect fill="white" height="32" width="32" />
            </clipPath>
          </defs>
        </TopNavHelper>
        <TopNavHelper additionalClassNames="relative shrink-0">
          <g clipPath="url(#clip0_246_2272)" id="Frame">
            <g id="Vector" />
            <path d={svgPaths.p2386b670} id="Vector_2" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p11ca82c0} id="Vector_3" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
          <defs>
            <clipPath id="clip0_246_2272">
              <rect fill="white" height="32" width="32" />
            </clipPath>
          </defs>
        </TopNavHelper>
        <div className="content-stretch flex gap-[4px] items-center relative shrink-0">
          <div className="pointer-events-none relative rounded-[256px] shrink-0 size-[32px]" data-name="Avatar">
            <div className="absolute inset-0 overflow-hidden rounded-[256px]">
              <img alt="" className="absolute h-[133.25%] left-0 max-w-none top-[0.56%] w-full" src={imgAvatar} />
            </div>
            <div aria-hidden="true" className="absolute border border-[#ececec] border-solid inset-0 rounded-[256px]" />
          </div>
          <p className="font-['Lato:Regular',sans-serif] leading-[18px] not-italic relative shrink-0 text-[#959595] text-[18px] whitespace-nowrap">James Brown</p>
          <div className="relative shrink-0 size-[24px]" data-name="Frame">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <g clipPath="url(#clip0_246_2115)" id="Frame">
                <g id="Vector" />
                <path d="M19.5 9L12 16.5L4.5 9" id="Vector_2" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </g>
              <defs>
                <clipPath id="clip0_246_2115">
                  <rect fill="white" height="24" width="24" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute bg-white h-[42px] left-[89px] rounded-[6px] top-[19px] w-[437px]" data-name="Search">
        <div className="overflow-clip relative rounded-[inherit] size-full">
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[42px] not-italic right-[4px] text-[#959595] text-[14px] top-[calc(50%-12px)] tracking-[-0.084px]">{`Search `}</p>
          <div className="-translate-y-1/2 absolute left-[12px] size-[24px] top-1/2" data-name="Frame">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <g clipPath="url(#clip0_246_2100)" id="Frame">
                <g id="Vector" />
                <path d={svgPaths.p452f780} id="Vector_2" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                <path d={svgPaths.p35d48f80} id="Vector_3" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </g>
              <defs>
                <clipPath id="clip0_246_2100">
                  <rect fill="white" height="24" width="24" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-[#ececec] border-solid inset-0 pointer-events-none rounded-[6px]" />
      </div>
      <TopNavHelper additionalClassNames="absolute left-[32px] top-[24px]">
        <g id="Frame">
          <path d={svgPaths.p2ccea580} fill="var(--fill-0, #878E9E)" id="Vector" />
        </g>
      </TopNavHelper>
      <div className={`absolute size-[20px] ${isVariant2 ? "left-[1567px] top-[21px]" : "left-[1413px] top-[20px]"}`}>
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
          <circle cx="10" cy="10" fill="var(--fill-0, #EF4444)" id="Ellipse 11" r="10" />
        </svg>
      </div>
      <p className={`absolute font-["Inter:Medium",sans-serif] font-medium leading-[24px] not-italic text-[11px] text-white uppercase whitespace-nowrap ${isVariant2 ? "left-[1571px] top-[19px]" : "left-[1417px] top-[18px]"}`}>12</p>
      <div className={`-translate-x-1/2 -translate-y-1/2 absolute h-[48px] top-[calc(50%-2px)] w-[209px] ${isVariant2 ? "left-[calc(50%+456px)]" : "left-[calc(50%+378px)]"}`} data-name="Button with icon">
        <div className={`absolute ${isVariant2 ? "inset-[-4.37%_-2.92%_-21.04%_-2.92%]" : "inset-[-4.37%_-2.37%_-21.04%_-2.37%]"}`}>
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox={isVariant2 ? "0 0 221.2 60.2" : "0 0 269.2 60.2"}>
            <g filter={isVariant2 ? "url(#filter0_di_246_2095)" : "url(#filter0_di_246_2256)"} id="Rectangle 24">
              <path d={isVariant2 ? svgPaths.p1ad2ef60 : svgPaths.p18e76f80} fill="white" />
              <path d={isVariant2 ? svgPaths.p7b2e700 : svgPaths.p1a9bc400} stroke="var(--stroke-0, #2563EB)" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="60.2" id={isVariant2 ? "filter0_di_246_2095" : "filter0_di_246_2256"} width={isVariant2 ? "221.2" : "269.2"} x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="3.05" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values={isVariant2 ? "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" : "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"} />
                <feBlend in2="BackgroundImageFix" mode="normal" result={isVariant2 ? "effect1_dropShadow_246_2095" : "effect1_dropShadow_246_2256"} />
                <feBlend in="SourceGraphic" in2={isVariant2 ? "effect1_dropShadow_246_2095" : "effect1_dropShadow_246_2256"} mode="normal" result="shape" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dx="-3" dy="4" />
                <feGaussianBlur stdDeviation="2.45" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.39 0" />
                <feBlend in2="shape" mode="normal" result={isVariant2 ? "effect2_innerShadow_246_2095" : "effect2_innerShadow_246_2256"} />
              </filter>
            </defs>
          </svg>
        </div>
        <div className="absolute content-stretch flex h-[30px] items-center justify-center left-[28px] top-[9px]">
          <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
            {property1 === "Default" && (
              <div className="col-1 ml-0 mt-0 relative row-1 size-[30px]" data-name="ic:baseline-plus">
                <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
                  <g id="ic:baseline-plus">
                    <path d={svgPaths.p267c4d70} fill="var(--fill-0, #2563EB)" id="Vector" />
                  </g>
                </svg>
              </div>
            )}
            <p className="col-1 font-['Inter:Medium',sans-serif] font-medium leading-[normal] ml-[36px] mt-[3px] not-italic relative row-1 text-[#2563eb] text-[18px] whitespace-nowrap">{isVariant2 ? "Mogzu Assistant" : "Add New learnings"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
type CorportateMenuProps = {
  className?: string;
  property1?: "Default" | "Variant2" | "Activity Suite" | "Activity Suite large" | "Bookings" | "Users" | "Notification" | "Communication" | "Report" | "Transactions" | "Users large" | "Favorites" | "Settings";
};

function CorportateMenu({ className, property1 = "Default" }: CorportateMenuProps) {
  const isActivitySuite = property1 === "Activity Suite";
  const isActivitySuiteLarge = property1 === "Activity Suite large";
  const isActivitySuiteLargeOrUsersLarge = ["Activity Suite large", "Users large"].includes(property1);
  const isBookings = property1 === "Bookings";
  const isCommunication = property1 === "Communication";
  const isDefaultOrActivitySuiteLargeOrUsersLarge = ["Default", "Activity Suite large", "Users large"].includes(property1);
  const isFavorites = property1 === "Favorites";
  const isNotification = property1 === "Notification";
  const isReport = property1 === "Report";
  const isSettings = property1 === "Settings";
  const isTransactions = property1 === "Transactions";
  const isUsersLarge = property1 === "Users large";
  const isUsersLargeOrUsers = ["Users large", "Users"].includes(property1);
  const isVariant2OrActivitySuiteOrBookingsOrUsersOrCommunicationOr = ["Variant2", "Activity Suite", "Bookings", "Users", "Communication", "Report", "Transactions", "Settings", "Favorites"].includes(property1);
  const isVariant2OrActivitySuiteOrBookingsOrUsersOrNotificationOr = ["Variant2", "Activity Suite", "Bookings", "Users", "Notification", "Communication", "Report", "Transactions", "Settings", "Favorites"].includes(property1);
  const isVariant2OrActivitySuiteOrBookingsOrUsersOrNotificationOr1 = ["Variant2", "Activity Suite", "Bookings", "Users", "Notification", "Communication", "Report", "Transactions", "Favorites"].includes(property1);
  return (
    <div className={className || `bg-white h-[1317px] relative ${isVariant2OrActivitySuiteOrBookingsOrUsersOrNotificationOr ? "w-[109px]" : "w-[265px]"}`}>
      <div className="flex flex-col items-center size-full">
        <div className="content-stretch flex flex-col gap-[12px] items-center relative size-full">
          <div className="h-[79px] overflow-clip relative shrink-0 w-full">
            <div className={`absolute ${isVariant2OrActivitySuiteOrBookingsOrUsersOrNotificationOr ? "h-[60px] left-[21px] top-[12px] w-[58px]" : "h-[42px] left-[26px] top-[22px] w-[131px]"}`} data-name="image 24877">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img alt="" className={`absolute h-[144.12%] max-w-none top-[-26.47%] ${isVariant2OrActivitySuiteOrBookingsOrUsersOrNotificationOr ? "left-[-60.03%] w-[429.19%]" : "left-[-18.33%] w-[131.05%]"}`} src={imgImage24877} />
              </div>
            </div>
          </div>
          <div className={`content-stretch flex h-[52px] items-center overflow-clip px-[24px] py-[5px] relative rounded-[6px] shrink-0 ${["Activity Suite", "Bookings", "Users", "Notification", "Communication", "Report", "Transactions", "Settings", "Favorites"].includes(property1) ? "w-[77px]" : property1 === "Variant2" ? "bg-[#2563eb] w-[77px]" : isActivitySuiteLargeOrUsersLarge ? "gap-[10px] w-[241px]" : "bg-[#2563eb] gap-[10px] w-[241px]"}`}>
            {["Activity Suite large", "Users large", "Activity Suite", "Bookings", "Users", "Notification", "Communication", "Report", "Transactions", "Settings", "Favorites"].includes(property1) && (
              <Wrapper7>
                <g id="house (2) 1">
                  <path d={svgPaths.p2ab88b80} fill="var(--fill-0, #878E9E)" id="Vector" />
                </g>
              </Wrapper7>
            )}
            {["Default", "Variant2"].includes(property1) && (
              <CorportateMenuFrame>
                <path d={svgPaths.p1d971400} fill="var(--fill-0, white)" id="Vector" />
              </CorportateMenuFrame>
            )}
            {isDefaultOrActivitySuiteLargeOrUsersLarge && <p className={`font-["Inter:Medium",sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[20px] whitespace-nowrap ${isActivitySuiteLargeOrUsersLarge ? "text-[#878e9e]" : "text-white"}`}>Dashboard</p>}
          </div>
          <div className={`content-stretch flex gap-[10px] h-[52px] items-center overflow-clip px-[24px] py-[5px] relative rounded-[6px] shrink-0 ${isActivitySuite ? "bg-[#2563eb] w-[75px]" : ["Variant2", "Bookings", "Users", "Notification", "Communication", "Report", "Transactions", "Settings", "Favorites"].includes(property1) ? "w-[75px]" : isActivitySuiteLarge ? "bg-[#2563eb] w-[241px]" : "w-[241px]"}`}>
            <CorportateMenuFrame>
              <path d={isActivitySuite ? svgPaths.p414b380 : ["Users large", "Variant2", "Bookings", "Users", "Notification", "Communication", "Report", "Transactions", "Settings", "Favorites"].includes(property1) ? svgPaths.p1d95f2f0 : isActivitySuiteLarge ? svgPaths.p31e0ae00 : svgPaths.p2c29c800} fill={["Activity Suite large", "Activity Suite"].includes(property1) ? "var(--fill-0, white)" : "var(--fill-0, #878E9E)"} id="Vector" />
            </CorportateMenuFrame>
            {isDefaultOrActivitySuiteLargeOrUsersLarge && <p className={`font-["Inter:Medium",sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[20px] w-[141px] ${isActivitySuiteLarge ? "text-white" : "text-[#878e9e]"}`}>Activity Suite</p>}
          </div>
          <div className={`content-stretch flex gap-[10px] h-[52px] items-center overflow-clip px-[24px] py-[5px] relative rounded-[6px] shrink-0 ${isBookings ? "bg-[#2563eb] w-[75px]" : ["Variant2", "Activity Suite", "Users", "Notification", "Communication", "Report", "Transactions", "Settings", "Favorites"].includes(property1) ? "w-[75px]" : "w-[241px]"}`}>
            <CorportateMenuFrame>
              <path d={isBookings ? svgPaths.pc099f00 : svgPaths.paf72c00} fill={isBookings ? "var(--fill-0, white)" : "var(--fill-0, #878E9E)"} id="Vector" />
            </CorportateMenuFrame>
            {isDefaultOrActivitySuiteLargeOrUsersLarge && <p className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[#878e9e] text-[20px] whitespace-nowrap">Bookings</p>}
          </div>
          <div className={`content-stretch flex gap-[10px] h-[52px] items-center overflow-clip px-[24px] py-[5px] relative rounded-[6px] shrink-0 ${isFavorites ? "bg-[#2563eb] w-[75px]" : ["Variant2", "Activity Suite", "Bookings", "Users", "Notification", "Communication", "Report", "Transactions", "Settings"].includes(property1) ? "w-[75px]" : "w-[241px]"}`}>
            <Wrapper7>
              <g clipPath={isFavorites ? "url(#clip0_246_2329)" : "url(#clip0_246_2162)"} id="Heart Icon">
                <g id="Frame">
                  <path d={svgPaths.p27070280} fill="var(--fill-0, #878E9E)" id="Vector" />
                </g>
                {isFavorites && <path d={svgPaths.p25a11880} fill="var(--fill-0, white)" id="Vector_2" />}
              </g>
              <defs>
                <clipPath id={isFavorites ? "clip0_246_2329" : "clip0_246_2162"}>
                  <rect fill="white" height="28" width="28" />
                </clipPath>
              </defs>
            </Wrapper7>
            {isDefaultOrActivitySuiteLargeOrUsersLarge && <p className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[#878e9e] text-[20px] whitespace-nowrap">Favorites</p>}
          </div>
          <div className={`content-stretch flex gap-[10px] h-[52px] items-center overflow-clip px-[24px] py-[5px] relative rounded-[6px] shrink-0 ${property1 === "Users" ? "bg-[#2563eb] w-[75px]" : ["Variant2", "Activity Suite", "Bookings", "Notification", "Communication", "Report", "Transactions", "Settings", "Favorites"].includes(property1) ? "w-[75px]" : isUsersLarge ? "bg-[#2563eb] w-[241px]" : "w-[241px]"}`}>
            <CorportateMenuFrame>
              <path d={isUsersLargeOrUsers ? svgPaths.p282b0100 : svgPaths.p29193540} fill={isUsersLargeOrUsers ? "var(--fill-0, #FBFBFB)" : "var(--fill-0, #878E9E)"} id="Vector" />
            </CorportateMenuFrame>
            {isDefaultOrActivitySuiteLargeOrUsersLarge && (
              <>
                <p className={`font-["Inter:Medium",sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[20px] w-[141px] ${isUsersLarge ? "text-white" : "text-[#878e9e]"}`}>Users</p>
                <CorportateMenuFrame1 additionalClassNames="relative shrink-0">
                  <path d={svgPaths.p30a2f900} fill={isUsersLarge ? "var(--fill-0, white)" : "var(--fill-0, #878E9E)"} id="Vector" />
                </CorportateMenuFrame1>
              </>
            )}
          </div>
          <div className={`content-stretch flex gap-[10px] h-[52px] items-center overflow-clip px-[24px] py-[5px] relative rounded-[6px] shrink-0 ${isNotification ? "bg-[#2563eb] w-[75px]" : isVariant2OrActivitySuiteOrBookingsOrUsersOrCommunicationOr ? "w-[75px]" : "w-[241px]"}`}>
            <CorportateMenuFrame>
              <path d={isNotification ? svgPaths.p21b65080 : isVariant2OrActivitySuiteOrBookingsOrUsersOrCommunicationOr ? svgPaths.p3e2aee80 : svgPaths.p4e64800} fill={isNotification ? "var(--fill-0, white)" : "var(--fill-0, #878E9E)"} id="Vector" />
            </CorportateMenuFrame>
            {isDefaultOrActivitySuiteLargeOrUsersLarge && <p className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[#878e9e] text-[20px] whitespace-nowrap">Notification</p>}
          </div>
          <div className={`h-[52px] overflow-clip relative rounded-[6px] shrink-0 ${isCommunication ? "bg-[#2563eb] content-stretch flex gap-[10px] items-center px-[24px] py-[5px] w-[75px]" : ["Variant2", "Activity Suite", "Bookings", "Users", "Notification", "Report", "Transactions", "Settings", "Favorites"].includes(property1) ? "content-stretch flex gap-[10px] items-center px-[24px] py-[5px] w-[75px]" : "w-[253px]"}`}>
            <div className={`size-[28px] ${isVariant2OrActivitySuiteOrBookingsOrUsersOrNotificationOr ? "relative shrink-0" : "absolute left-[30px] top-[12px]"}`} data-name="Frame">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
                <g id="Frame">
                  <path d={isCommunication ? svgPaths.p17e79170 : svgPaths.p319d300} fill={isCommunication ? "var(--fill-0, white)" : "var(--fill-0, #878E9E)"} id="Vector" />
                </g>
              </svg>
            </div>
            {isDefaultOrActivitySuiteLargeOrUsersLarge && (
              <>
                <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[68px] not-italic text-[#878e9e] text-[20px] top-[12px] whitespace-nowrap">Communication</p>
                <CorportateMenuFrame1 additionalClassNames="absolute left-[229px] top-[14px]">
                  <path d={svgPaths.pee84b80} fill="var(--fill-0, #878E9E)" id="Vector" />
                </CorportateMenuFrame1>
              </>
            )}
          </div>
          <div className={`content-stretch flex gap-[10px] h-[52px] items-center overflow-clip px-[24px] py-[5px] relative rounded-[6px] shrink-0 ${isReport ? "bg-[#2563eb] w-[75px]" : ["Variant2", "Activity Suite", "Bookings", "Users", "Notification", "Communication", "Transactions", "Settings", "Favorites"].includes(property1) ? "w-[75px]" : "w-[241px]"}`}>
            <CorportateMenuFrame>
              <path d={isReport ? svgPaths.p1d087900 : svgPaths.p1f81a280} fill={isReport ? "var(--fill-0, white)" : "var(--fill-0, #878E9E)"} id="Vector" />
            </CorportateMenuFrame>
            {isDefaultOrActivitySuiteLargeOrUsersLarge && <p className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[#878e9e] text-[20px] whitespace-nowrap">Report</p>}
          </div>
          <div className={`content-stretch flex gap-[10px] h-[52px] items-center overflow-clip px-[24px] relative rounded-[6px] shrink-0 ${isTransactions ? "bg-[#2563eb] justify-center py-[10px]" : ["Variant2", "Activity Suite", "Bookings", "Users", "Notification", "Communication", "Report", "Settings", "Favorites"].includes(property1) ? "justify-center py-[5px] w-[76px]" : "py-[5px] w-[241px]"}`}>
            {["Default", "Activity Suite large", "Users large", "Variant2", "Activity Suite", "Bookings", "Users", "Notification", "Communication", "Report", "Settings", "Favorites"].includes(property1) && (
              <Wrapper7 additionalClassNames="overflow-clip">
                <g id="money (2) 1">
                  <path d={svgPaths.p2683f80} fill="var(--fill-0, #878E9E)" id="Vector" />
                </g>
              </Wrapper7>
            )}
            {isDefaultOrActivitySuiteLargeOrUsersLarge && <p className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[#878e9e] text-[20px] whitespace-nowrap">Transactions</p>}
            {isTransactions && (
              <Wrapper7>
                <g id="money-fill 1">
                  <path d={svgPaths.p104d0a80} fill="var(--fill-0, white)" id="Vector" />
                </g>
              </Wrapper7>
            )}
          </div>
          <div className={`content-stretch flex gap-[10px] h-[52px] items-center overflow-clip px-[24px] py-[5px] relative rounded-[6px] shrink-0 ${isSettings ? "bg-[#2563eb] w-[75px]" : isVariant2OrActivitySuiteOrBookingsOrUsersOrNotificationOr1 ? "w-[75px]" : "w-[241px]"}`}>
            <CorportateMenuFrame>
              <path d={isSettings ? svgPaths.p31811600 : isVariant2OrActivitySuiteOrBookingsOrUsersOrNotificationOr1 ? svgPaths.p32caf6b0 : svgPaths.pde1bb00} fill={isSettings ? "var(--fill-0, white)" : "var(--fill-0, #878E9E)"} id="Vector" />
            </CorportateMenuFrame>
            {isDefaultOrActivitySuiteLargeOrUsersLarge && <p className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[#878e9e] text-[20px] whitespace-nowrap">Settings</p>}
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#ececec] border-r border-solid inset-0 pointer-events-none" />
    </div>
  );
}

export default function Reports() {
  return (
    <div className="bg-[#eef1f9] relative size-full" data-name="Reports">
      <div className="absolute bg-white h-[224px] left-[142px] overflow-clip rounded-[6px] top-[112px] w-[1746px]">
        <div className="absolute bg-[rgba(37,99,235,0.1)] h-[143px] left-[24px] overflow-clip rounded-[6px] top-[56px] w-[255px]">
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#475569] text-[16px] top-[16px] w-[147px]">Total booking</p>
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[40px] left-[16px] not-italic text-[#2563eb] text-[32px] top-[44px] w-[55px]">175</p>
          <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[38.5px] not-italic text-[#2563eb] text-[14px] text-center top-[90px] whitespace-nowrap">+3.25</p>
          <Wrapper1 additionalClassNames="absolute left-[64px] top-[92px]">
            <path d={svgPaths.p974300} fill="var(--fill-0, #2563EB)" id="Vector" />
          </Wrapper1>
          <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[70px] not-italic text-[#878e9e] text-[14px] text-center top-[110px] whitespace-nowrap">than last month</p>
          <Wrapper>
            <path d={svgPaths.p72d9900} fill="var(--fill-0, #2563EB)" id="Vector 67" opacity="0.1" />
            <path d={svgPaths.p3a243b00} id="Vector 68" stroke="var(--stroke-0, #2563EB)" strokeWidth="2" />
          </Wrapper>
        </div>
        <div className="absolute bg-[rgba(250,141,64,0.1)] h-[143px] left-[312px] overflow-clip rounded-[6px] top-[56px] w-[255px]">
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#475569] text-[16px] top-[16px] w-[147px]">Total request</p>
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[40px] left-[16px] not-italic text-[#fa8d40] text-[32px] top-[44px] whitespace-nowrap">64</p>
          <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[38.5px] not-italic text-[#fa8d40] text-[14px] text-center top-[90px] whitespace-nowrap">+3.25</p>
          <Wrapper1 additionalClassNames="absolute left-[64px] top-[92px]">
            <path d={svgPaths.p974300} fill="var(--fill-0, #FA8D40)" id="Vector" />
          </Wrapper1>
          <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[70px] not-italic text-[#878e9e] text-[14px] text-center top-[110px] whitespace-nowrap">than last month</p>
          <Wrapper>
            <path d={svgPaths.p72d9900} fill="var(--fill-0, #FA8D40)" id="Vector 67" opacity="0.1" />
            <path d={svgPaths.p3a243b00} id="Vector 68" stroke="var(--stroke-0, #FA8D40)" strokeWidth="2" />
          </Wrapper>
        </div>
        <div className="absolute bg-[rgba(52,197,220,0.1)] h-[143px] left-[888px] overflow-clip rounded-[6px] top-[56px] w-[255px]">
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#475569] text-[16px] top-[16px] w-[147px]">Total Savings</p>
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[40px] left-[16px] not-italic text-[#34c5dc] text-[32px] top-[44px] whitespace-nowrap">3246</p>
          <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[38.5px] not-italic text-[#34c5dc] text-[14px] text-center top-[90px] whitespace-nowrap">+3.25</p>
          <Wrapper1 additionalClassNames="absolute left-[64px] top-[92px]">
            <path d={svgPaths.p974300} fill="var(--fill-0, #34C5DC)" id="Vector" />
          </Wrapper1>
          <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[70px] not-italic text-[#878e9e] text-[14px] text-center top-[110px] whitespace-nowrap">than last month</p>
          <Wrapper>
            <path d={svgPaths.p72d9900} fill="var(--fill-0, #34C5DC)" id="Vector 67" opacity="0.1" />
            <path d={svgPaths.p3a243b00} id="Vector 68" stroke="var(--stroke-0, #34C5DC)" strokeWidth="2" />
          </Wrapper>
        </div>
        <div className="absolute bg-[rgba(34,197,94,0.1)] h-[143px] left-[600px] overflow-clip rounded-[6px] top-[56px] w-[255px]">
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#475569] text-[16px] top-[16px] w-[147px]">{`Total employees `}</p>
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[40px] left-[16px] not-italic text-[#22c55e] text-[32px] top-[44px] whitespace-nowrap">25</p>
          <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[38.5px] not-italic text-[#22c55e] text-[14px] text-center top-[90px] whitespace-nowrap">+3.25</p>
          <Frame additionalClassNames="left-[64px] top-[92px]" />
          <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[70px] not-italic text-[#878e9e] text-[14px] text-center top-[110px] whitespace-nowrap">than last month</p>
          <Wrapper>
            <path d={svgPaths.p72d9900} fill="var(--fill-0, #22C55E)" id="Vector 67" opacity="0.1" />
            <path d={svgPaths.p3a243b00} id="Vector 68" stroke="var(--stroke-0, #22C55E)" strokeWidth="2" />
          </Wrapper>
        </div>
        <div className="absolute bg-[rgba(239,68,68,0.1)] h-[143px] left-[1176px] overflow-clip rounded-[6px] top-[56px] w-[255px]">
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#475569] text-[16px] top-[16px] w-[147px]">{`Payment Pending `}</p>
          <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[40px] left-[16px] not-italic text-[#ef4444] text-[32px] top-[44px] whitespace-nowrap">1215</p>
          <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[38.5px] not-italic text-[#ef4444] text-[14px] text-center top-[90px] whitespace-nowrap">+3.25</p>
          <Frame1 additionalClassNames="absolute left-[64px] top-[92px]" />
          <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[70px] not-italic text-[#878e9e] text-[14px] text-center top-[110px] whitespace-nowrap">than last month</p>
          <Wrapper>
            <path d={svgPaths.p72d9900} fill="var(--fill-0, #EF4444)" id="Vector 67" opacity="0.1" />
            <path d={svgPaths.p3a243b00} id="Vector 68" stroke="var(--stroke-0, #EF4444)" strokeWidth="2" />
          </Wrapper>
        </div>
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[24px] not-italic text-[20px] text-black top-[16px] whitespace-nowrap">Overview</p>
      </div>
      <div className="absolute bg-white content-stretch flex flex-col items-start left-[141px] overflow-clip rounded-[12px] top-[364px] w-[1092px]">
        <div className="h-[59px] overflow-clip relative shrink-0 w-full">
          <p className="absolute font-['Inter:Medium',sans-serif] font-medium h-[27px] leading-[28px] left-[24px] not-italic text-[#0e1e3f] text-[20px] top-[20px] w-[167px]">{`Total Spent `}</p>
          <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[220.5px] not-italic text-[#22c55e] text-[14px] text-center top-[25px] whitespace-nowrap">+3.25</p>
          <Frame additionalClassNames="left-[246px] top-[25px]" />
          <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[322px] not-italic text-[#878e9e] text-[14px] text-center top-[25px] whitespace-nowrap">than last year</p>
          <div className="absolute inset-[20.34%_2.01%_18.64%_83.42%] rounded-[4px]" data-name="Button 3">
            <div aria-hidden="true" className="absolute border border-[#cbd5e1] border-solid inset-0 pointer-events-none rounded-[4px]" />
            <div className="flex flex-row items-center justify-center size-full">
              <div className="content-stretch flex gap-[10px] items-center justify-center px-[16px] py-[17px] relative size-full">
                <div className="flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] not-italic relative shrink-0 text-[#0e1e3f] text-[18px] text-center whitespace-nowrap">
                  <p className="leading-[24px]">This year</p>
                </div>
                <Frame1973341981CaretDown additionalClassNames="relative shrink-0">
                  <path d={svgPaths.p13567b00} fill="var(--fill-0, #2563EB)" id="Vector" />
                </Frame1973341981CaretDown>
              </div>
            </div>
          </div>
          <Frame1973341981CaretDown additionalClassNames="absolute left-[167px] top-[23px]">
            <path d={svgPaths.p13567b00} fill="var(--fill-0, #0E1E3F)" id="Vector" />
          </Frame1973341981CaretDown>
          <Text text="Gifting" additionalClassNames="left-[803px]">
            <circle cx="10" cy="10" fill="var(--fill-0, #22C55E)" id="Ellipse 3381" r="10" />
          </Text>
          <Text text="Event" additionalClassNames="left-[700px]">
            <circle cx="10" cy="10" fill="var(--fill-0, #EF4444)" id="Ellipse 3381" r="10" />
          </Text>
          <Text text="SpaceX" additionalClassNames="left-[582px]">
            <circle cx="10" cy="10" fill="var(--fill-0, #FA8D40)" id="Ellipse 3381" r="10" />
          </Text>
        </div>
        <div className="h-[296px] overflow-clip relative shrink-0 w-full">
          <div className="absolute contents left-[22px] top-[12px]">
            <div className="absolute contents left-[22px] top-[12px]">
              <div className="absolute contents left-[22px] top-[12px]">
                <div className="absolute contents left-[22px] top-[12px]">
                  <Wrapper11 additionalClassNames="h-[229px] top-[12px]">
                    <div className="h-0 relative w-[229px]">
                      <div className="absolute inset-[-0.5px_0_0_0]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 229 0.5">
                          <line id="Line 4" opacity="0.5" stroke="var(--stroke-0, #919BB0)" strokeWidth="0.5" x2="229" y1="0.25" y2="0.25" />
                        </svg>
                      </div>
                    </div>
                  </Wrapper11>
                  <div className="absolute content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[22px] items-start leading-[1.5] left-[22px] not-italic text-[#919bb0] text-[12px] top-[12px] tracking-[-0.132px]">
                    <p className="relative shrink-0 text-right w-[23px]">1L</p>
                    <p className="relative shrink-0 text-center whitespace-nowrap">90K</p>
                    <p className="relative shrink-0 text-center whitespace-nowrap">80K</p>
                    <p className="relative shrink-0 text-center whitespace-nowrap">50K</p>
                    <p className="relative shrink-0 text-center whitespace-nowrap">30K</p>
                    <p className="relative shrink-0 text-center whitespace-nowrap">10K</p>
                  </div>
                </div>
                <div className="absolute contents left-[54px] top-[137px]">
                  <div className="absolute contents left-[54px] top-[241px]">
                    <div className="absolute h-0 left-[54px] top-[241px] w-[1013px]">
                      <div className="absolute inset-[-0.5px_0_0_0]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1013 0.5">
                          <line id="Line 3" opacity="0.5" stroke="var(--stroke-0, #919BB0)" strokeWidth="0.5" x2="1013" y1="0.25" y2="0.25" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="absolute contents left-[54px] top-[137px]">
                    <div className="absolute h-0 left-[54px] top-[159px] w-[1013px]">
                      <div className="absolute inset-[-2px_0_0_0]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1013 2">
                          <line id="Line 5" stroke="var(--stroke-0, #B6B6E5)" strokeDasharray="10 10" strokeWidth="2" x2="1013" y1="1" y2="1" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute contents left-[1035px] top-[137px]">
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.5] left-[1035px] not-italic text-[#5c5d99] text-[12px] top-[137px] tracking-[-0.132px] whitespace-nowrap">52L</p>
                      <Info additionalClassNames="left-[1057px]" />
                    </div>
                  </div>
                  <div className="absolute content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[63px] items-start leading-[1.5] left-[87px] not-italic text-[#919bb0] text-[12px] text-center top-[249px] tracking-[-0.132px] whitespace-nowrap">
                    <p className="relative shrink-0">Jan</p>
                    <p className="relative shrink-0">Feb</p>
                    <p className="relative shrink-0">Mar</p>
                    <p className="relative shrink-0">Apr</p>
                    <p className="relative shrink-0">May</p>
                    <p className="relative shrink-0">Jun</p>
                    <p className="relative shrink-0">Jul</p>
                    <p className="relative shrink-0">Aug</p>
                    <p className="relative shrink-0">Sep</p>
                    <p className="relative shrink-0">Oct</p>
                    <p className="relative shrink-0">Nov</p>
                    <p className="relative shrink-0">Dec</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bg-[#22c55e] h-[131px] left-[105px] rounded-tl-[2px] rounded-tr-[2px] top-[110px] w-[12px]" />
          <div className="absolute bg-[#ef4444] h-[35px] left-[93px] rounded-tl-[2px] rounded-tr-[2px] top-[206px] w-[12px]" />
          <div className="absolute bg-[#fa8d40] h-[79px] left-[81px] rounded-tl-[2px] rounded-tr-[2px] top-[162px] w-[12px]" />
          <div className="absolute bg-[#ef4444] h-[131px] left-[176px] rounded-tl-[2px] rounded-tr-[2px] top-[110px] w-[12px]" />
          <div className="absolute bg-[#629fff] h-[51px] left-[188px] rounded-tl-[2px] rounded-tr-[2px] top-[190px] w-[12px]" />
          <div className="absolute bg-[#fa8d40] h-[82px] left-[164px] rounded-tl-[2px] rounded-tr-[2px] top-[159px] w-[12px]" />
          <div className="absolute bg-[#22c55e] h-[51px] left-[271px] rounded-tl-[2px] rounded-tr-[2px] top-[190px] w-[12px]" />
          <div className="absolute bg-[#fa8d40] h-[156px] left-[247px] rounded-tl-[2px] rounded-tr-[2px] top-[85px] w-[12px]" />
          <div className="absolute bg-[#ef4444] h-[35px] left-[344px] rounded-tl-[2px] rounded-tr-[2px] top-[206px] w-[12px]" />
          <div className="absolute bg-[#ef4444] h-[35px] left-[429px] rounded-tl-[2px] rounded-tr-[2px] top-[206px] w-[12px]" />
          <div className="absolute bg-[#22c55e] h-[56px] left-[356px] rounded-tl-[2px] rounded-tr-[2px] top-[185px] w-[12px]" />
          <div className="absolute bg-[#22c55e] h-[162px] left-[527px] rounded-tl-[2px] rounded-tr-[2px] top-[79px] w-[12px]" />
          <div className="absolute bg-[#fa8d40] h-[82px] left-[332px] rounded-tl-[2px] rounded-tr-[2px] top-[159px] w-[12px]" />
          <div className="absolute bg-[#fa8d40] h-[56px] left-[503px] rounded-tl-[2px] rounded-tr-[2px] top-[185px] w-[12px]" />
          <div className="absolute bg-[#fa8d40] h-[176px] left-[417px] rounded-tl-[2px] rounded-tr-[2px] top-[65px] w-[12px]" />
        </div>
      </div>
      <div className="absolute bg-white content-stretch flex flex-col items-start left-[141px] overflow-clip rounded-[12px] top-[747px] w-[1747px]">
        <Wrapper3>Order overview</Wrapper3>
        <Wrapper4>
          <Wrapper5 additionalClassNames="h-[79px] w-full">
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium h-[27px] leading-[28px] left-[24px] not-italic text-[#0e1e3f] text-[20px] top-[calc(50%-13.5px)] w-[167px]">Order</p>
            <Helper />
            <p className="-translate-x-full absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[1590px] not-italic text-[16px] text-black text-right top-[30px] whitespace-nowrap">{` ₹4,37,802`}</p>
            <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[1631px] not-italic text-[#22c55e] text-[14px] text-center top-[32px] whitespace-nowrap">+3.25%</p>
            <Frame additionalClassNames="left-[1662px] top-[32px]" />
          </Wrapper5>
          <Wrapper5 additionalClassNames="h-[79px] w-full">
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[24px] not-italic text-[#0e1e3f] text-[20px] top-[calc(50%-13.5px)] whitespace-nowrap">{`Completed orders `}</p>
            <Helper2 />
            <p className="-translate-x-full absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[1590px] not-italic text-[16px] text-black text-right top-[30px] whitespace-nowrap">37,802</p>
            <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[1631px] not-italic text-[#ef4444] text-[14px] text-center top-[32px] whitespace-nowrap">-3.25%</p>
            <div className="absolute flex items-center justify-center left-[1662px] size-[18px] top-[32px]">
              <div className="-scale-y-100 flex-none">
                <Frame1 additionalClassNames="relative" />
              </div>
            </div>
          </Wrapper5>
          <Helper3 text="Pending orders" text1="2402" text2="-3.25%" />
          <Wrapper5 additionalClassNames="h-[79px] w-full">
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[24px] not-italic text-[#0e1e3f] text-[20px] top-[calc(50%-13.5px)] whitespace-nowrap">{`Cancelled orders `}</p>
            <Helper2 />
            <p className="-translate-x-full absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[1590px] not-italic text-[16px] text-black text-right top-[30px] whitespace-nowrap">7,802</p>
            <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[1631px] not-italic text-[#ef4444] text-[14px] text-center top-[32px] whitespace-nowrap">-3.25%</p>
            <div className="absolute flex items-center justify-center left-[1662px] size-[18px] top-[32px]">
              <div className="-scale-y-100 flex-none">
                <Frame1 additionalClassNames="relative" />
              </div>
            </div>
          </Wrapper5>
          <Helper3 text="Order request" text1="1202" text2="-3.25%" />
        </Wrapper4>
      </div>
      <div className="absolute bg-white content-stretch flex flex-col items-start left-[141px] overflow-clip rounded-[12px] top-[1253px] w-[1747px]">
        <Wrapper3>{`Employee spend `}</Wrapper3>
        <Wrapper4>
          <Wrapper5 additionalClassNames="h-[79px] w-full">
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium h-[27px] leading-[28px] left-[24px] not-italic text-[#0e1e3f] text-[20px] top-[calc(50%-13.5px)] w-[167px]">Events</p>
            <Helper />
            <p className="-translate-x-full absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[1592px] not-italic text-[16px] text-black text-right top-[30px] whitespace-nowrap">5,802</p>
            <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[1631px] not-italic text-[#22c55e] text-[14px] text-center top-[32px] whitespace-nowrap">+3.25%</p>
            <Frame additionalClassNames="left-[1662px] top-[32px]" />
          </Wrapper5>
          <Wrapper5 additionalClassNames="h-[79px] w-full">
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[24px] not-italic text-[#0e1e3f] text-[20px] top-[calc(50%-13.5px)] whitespace-nowrap">SpaceX</p>
            <Helper2 />
            <p className="-translate-x-full absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[1592px] not-italic text-[16px] text-black text-right top-[30px] whitespace-nowrap">37,802</p>
            <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[1631px] not-italic text-[#ef4444] text-[14px] text-center top-[32px] whitespace-nowrap">-3.25%</p>
            <div className="absolute flex items-center justify-center left-[1662px] size-[18px] top-[32px]">
              <div className="-scale-y-100 flex-none">
                <Frame1 additionalClassNames="relative" />
              </div>
            </div>
          </Wrapper5>
          <Wrapper5 additionalClassNames="h-[79px] w-[1683px]">
            <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[24px] not-italic text-[#0e1e3f] text-[20px] top-[calc(50%-13.5px)] whitespace-nowrap">{`Gifting `}</p>
            <div className="absolute h-[57px] left-[1111px] top-[7px] w-[359px]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 359 57">
                <g id="Group 1000004873">
                  <path d={svgPaths.p25365700} fill="var(--fill-0, #2563EB)" fillOpacity="0.1" id="Vector 375" />
                  <path d={svgPaths.p13d36700} id="Vector 376" stroke="var(--stroke-0, #2563EB)" strokeWidth="2" />
                  <circle cx="3" cy="36" fill="var(--fill-0, #2563EB)" id="Ellipse 3384" r="3" />
                  <circle cx="91" cy="3" fill="var(--fill-0, #2563EB)" id="Ellipse 3385" r="3" />
                  <circle cx="179" cy="19" fill="var(--fill-0, #2563EB)" id="Ellipse 3386" r="3" />
                  <circle cx="244" cy="42" fill="var(--fill-0, #2563EB)" id="Ellipse 3387" r="3" />
                  <circle cx="310" cy="18" fill="var(--fill-0, #2563EB)" id="Ellipse 3388" r="3" />
                  <circle cx="356" cy="36" fill="var(--fill-0, #2563EB)" id="Ellipse 3389" r="3" />
                </g>
              </svg>
            </div>
            <p className="-translate-x-full absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[1592px] not-italic text-[16px] text-black text-right top-[30px] whitespace-nowrap">7,802</p>
            <p className="-translate-x-1/2 absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[1631px] not-italic text-[#22c55e] text-[14px] text-center top-[32px] whitespace-nowrap">+3.25%</p>
            <Frame additionalClassNames="left-[1662px] top-[32px]" />
          </Wrapper5>
        </Wrapper4>
      </div>
      <div className="absolute bg-white content-stretch flex flex-col items-start left-[1261px] overflow-clip rounded-[12px] top-[364px] w-[627px]">
        <div className="h-[59px] overflow-clip relative shrink-0 w-full">
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal h-[27px] leading-[24px] left-[24px] not-italic text-[#0e1e3f] text-[18px] top-[20px] w-[167px]">Total Savings</p>
        </div>
        <div className="h-[296px] overflow-clip relative shrink-0 w-full">
          <div className="absolute contents left-[22px] top-[47px]">
            <div className="absolute contents left-[22px] top-[47px]">
              <div className="absolute contents left-[22px] top-[47px]">
                <div className="absolute contents left-[22px] top-[47px]">
                  <Wrapper11 additionalClassNames="h-[194px] top-[47px]">
                    <div className="h-0 relative w-[194px]">
                      <div className="absolute inset-[-0.5px_0_0_0]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 194 0.5">
                          <line id="Line 4" opacity="0.5" stroke="var(--stroke-0, #919BB0)" strokeWidth="0.5" x2="194" y1="0.25" y2="0.25" />
                        </svg>
                      </div>
                    </div>
                  </Wrapper11>
                  <div className="absolute content-stretch flex flex-col font-['Inter:Regular',sans-serif] font-normal gap-[16px] items-end leading-[1.5] left-[22px] not-italic text-[#919bb0] text-[12px] text-right top-[50px] tracking-[-0.132px]">
                    <p className="relative shrink-0 whitespace-nowrap">5L</p>
                    <p className="relative shrink-0 whitespace-nowrap">4L</p>
                    <p className="relative shrink-0 w-[23px]">3L</p>
                    <p className="relative shrink-0 whitespace-nowrap">2L</p>
                    <p className="relative shrink-0 whitespace-nowrap">1L</p>
                    <p className="relative shrink-0 whitespace-nowrap">50K</p>
                  </div>
                </div>
                <div className="absolute contents left-[54px] top-[137px]">
                  <div className="absolute contents left-[54px] top-[241px]">
                    <div className="absolute h-0 left-[54px] top-[241px] w-[548px]">
                      <div className="absolute inset-[-0.5px_0_0_0]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 548 0.5">
                          <line id="Line 3" opacity="0.5" stroke="var(--stroke-0, #919BB0)" strokeWidth="0.5" x2="548" y1="0.25" y2="0.25" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="absolute contents left-[54px] top-[137px]">
                    <div className="absolute h-0 left-[54px] top-[159px] w-[548px]">
                      <div className="absolute inset-[-2px_0_0_0]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 548 2">
                          <line id="Line 5" stroke="var(--stroke-0, #B6B6E5)" strokeDasharray="10 10" strokeWidth="2" x2="548" y1="1" y2="1" />
                        </svg>
                      </div>
                    </div>
                    <div className="absolute contents left-[586px] top-[137px]">
                      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.5] left-[586px] not-italic text-[#5c5d99] text-[12px] top-[137px] tracking-[-0.132px] whitespace-nowrap">52L</p>
                      <Info additionalClassNames="left-[608px]" />
                    </div>
                  </div>
                  <div className="absolute content-stretch flex font-['Inter:Regular',sans-serif] font-normal gap-[63px] items-start leading-[1.5] left-[70px] not-italic text-[#919bb0] text-[12px] text-center top-[249px] tracking-[-0.132px] whitespace-nowrap">
                    <p className="relative shrink-0">Jan</p>
                    <p className="relative shrink-0">Feb</p>
                    <p className="relative shrink-0">Mar</p>
                    <p className="relative shrink-0">Apr</p>
                    <p className="relative shrink-0">May</p>
                    <p className="relative shrink-0">Jun</p>
                    <p className="relative shrink-0">Jul</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute bg-[#2563eb] h-[123px] left-[81px] rounded-tl-[2px] rounded-tr-[2px] top-[118px] w-[12px]" />
          <div className="absolute bg-[#2563eb] h-[65px] left-[93px] opacity-31 rounded-tl-[2px] rounded-tr-[2px] top-[176px] w-[12px]" />
          <div className="absolute bg-[#2563eb] h-[97px] left-[69px] opacity-23 rounded-tl-[2px] rounded-tr-[2px] top-[144px] w-[12px]" />
          <div className="absolute bg-[#2563eb] h-[133px] left-[165px] rounded-tl-[2px] rounded-tr-[2px] top-[108px] w-[12px]" />
          <div className="absolute bg-[#2563eb] h-[105px] left-[153px] opacity-35 rounded-tl-[2px] rounded-tr-[2px] top-[136px] w-[12px]" />
          <div className="absolute bg-[#2563eb] h-[178px] left-[248px] rounded-tl-[2px] rounded-tr-[2px] top-[63px] w-[12px]" />
          <div className="absolute bg-[#2563eb] h-[105px] left-[331px] rounded-tl-[2px] rounded-tr-[2px] top-[136px] w-[12px]" />
          <div className="absolute bg-[#2563eb] h-[194px] left-[414px] rounded-tl-[2px] rounded-tr-[2px] top-[47px] w-[12px]" />
          <div className="absolute bg-[#2563eb] h-[194px] left-[502px] rounded-tl-[2px] rounded-tr-[2px] top-[47px] w-[11px]" />
          <div className="absolute bg-[#2563eb] h-[83px] left-[319px] opacity-35 rounded-tl-[2px] rounded-tr-[2px] top-[158px] w-[12px]" />
          <div className="absolute bg-[#2563eb] h-[141px] left-[236px] opacity-35 rounded-tl-[2px] rounded-tr-[2px] top-[100px] w-[12px]" />
          <div className="absolute bg-[#2563eb] h-[153px] left-[402px] opacity-35 rounded-tl-[2px] rounded-tr-[2px] top-[88px] w-[12px]" />
          <div className="absolute bg-[#2563eb] h-[153px] left-[491px] opacity-35 rounded-tl-[2px] rounded-tr-[2px] top-[88px] w-[11px]" />
          <Wrapper9 additionalClassNames="left-[25px]">
            <circle cx="6" cy="6" fill="var(--fill-0, #2563EB)" id="Ellipse 3382" r="6" />
          </Wrapper9>
          <Wrapper9 additionalClassNames="left-[141px]">
            <circle cx="6" cy="6" fill="var(--fill-0, #2563EB)" id="Ellipse 3383" opacity="0.35" r="6" />
          </Wrapper9>
          <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[155px] not-italic text-[16px] text-black top-[19px] whitespace-nowrap">{` ₹3,37,802`}</p>
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[155px] not-italic text-[#878e9e] text-[12px] top-0 whitespace-nowrap">{`Loss `}</p>
          <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[20px] left-[42px] not-italic text-[16px] text-black top-[19px] whitespace-nowrap">{` ₹4,37,802`}</p>
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16px] left-[42px] not-italic text-[#878e9e] text-[12px] top-0 whitespace-nowrap">Profit</p>
        </div>
      </div>
      <CorportateMenu className="absolute bg-white h-[1317px] left-0 top-0 w-[109px]" property1="Report" />
      <TopNav className="absolute bg-white h-[80px] right-0 top-0 w-[1811px]" property1="Variant2" />
    </div>
  );
}