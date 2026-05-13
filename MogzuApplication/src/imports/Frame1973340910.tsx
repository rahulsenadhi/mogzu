import clsx from "clsx";
import svgPaths from "./svg-qarikp4p4m";
import imgFrame24 from "figma:asset/f89db83641bb906adb1604f260e8fe4b09ed6652.png";
import imgRectangle34624814 from "figma:asset/897151d445638af709f42ef9508d1c68d2e14ad4.png";
import imgRectangle34624815 from "figma:asset/237de4c301ff7e10c241554e96c00291a021350f.png";
import imgRectangle34624816 from "figma:asset/2f96897fdd42cb423ee9595926ecde868b5d55d5.png";

function Wrapper2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="col-1 ml-0 mt-[0.7px] relative row-1 size-[16.715px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16.7154 16.7154">
        {children}
      </svg>
    </div>
  );
}
type Wrapper1Props = {
  additionalClassNames?: string;
};

function Wrapper1({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper1Props>) {
  return (
    <div className={clsx("col-1 mt-0 relative row-1 size-[32px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 32 32">
        {children}
      </svg>
    </div>
  );
}
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("h-0 relative", additionalClassNames)}>
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 128 1">
          {children}
        </svg>
      </div>
    </div>
  );
}
type Frame1973340910HelperProps = {
  additionalClassNames?: string;
};

function Frame1973340910Helper({ additionalClassNames = "" }: Frame1973340910HelperProps) {
  return (
    <div style={{ "--transform-inner-width": "1185", "--transform-inner-height": "21" } as React.CSSProperties} className={clsx("absolute flex h-[164px] items-center justify-center left-[438px] w-0", additionalClassNames)}>
      <div className="flex-none rotate-90">
        <div className="h-0 relative w-[164px]">
          <div className="absolute inset-[-1px_0_0_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 164 1">
              <line id="Line 1213" stroke="var(--stroke-0, #ECECEC)" x2="164" y1="0.5" y2="0.5" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
type Helper2Props = {
  additionalClassNames?: string;
};

function Helper2({ additionalClassNames = "" }: Helper2Props) {
  return (
    <div className={clsx("absolute bg-[#22c55e] content-stretch flex gap-[2px] items-center justify-center left-[725px] overflow-clip px-[5px] py-[2px] rounded-[55px] w-[68px]", additionalClassNames)}>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[16px] text-white whitespace-nowrap">{`4.5 `}</p>
      <div className="relative shrink-0 size-[18px]">
        <div className="absolute inset-[0_2.45%_9.55%_2.45%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.119 16.2812">
            <path d={svgPaths.p32db9e00} fill="var(--fill-0, white)" id="Star 4" />
          </svg>
        </div>
      </div>
    </div>
  );
}
type ImageProps = {
  additionalClassNames?: string;
};

function Image({ additionalClassNames = "" }: ImageProps) {
  return (
    <div className={clsx("absolute h-[105.168px] rounded-[4.875px] w-[167.85px]", additionalClassNames)}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[4.875px]">
        <img alt="" className="absolute h-[149.99%] left-[0.55%] max-w-none top-[-25.25%] w-[93.39%]" src={imgRectangle34624815} />
      </div>
    </div>
  );
}
type Group1000004650HelperProps = {
  additionalClassNames?: string;
};

function Group1000004650Helper({ additionalClassNames = "" }: Group1000004650HelperProps) {
  return (
    <div className={clsx("absolute size-[12.537px] top-[1428.6px]", additionalClassNames)}>
      <div className="absolute inset-[0_2.45%_9.55%_2.45%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 11.9229 11.3394">
          <path d={svgPaths.p35fbe500} fill="var(--fill-0, #8B8B8B)" id="Star 1" />
        </svg>
      </div>
    </div>
  );
}
type Helper1Props = {
  additionalClassNames?: string;
};

function Helper1({ additionalClassNames = "" }: Helper1Props) {
  return (
    <div className={clsx("absolute left-[222px] size-[30px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <circle cx="15" cy="15" fill="var(--fill-0, #FEC0AB)" id="Ellipse 3281" r="15" />
      </svg>
    </div>
  );
}

function Helper() {
  return (
    <div className="flex items-center justify-center relative shrink-0 w-full">
      <div className="flex-none rotate-180 w-full">
        <Wrapper additionalClassNames="w-full">
          <line id="Line 1213" stroke="var(--stroke-0, black)" strokeOpacity="0.2" x2="128" y1="0.5" y2="0.5" />
        </Wrapper>
      </div>
    </div>
  );
}
type ActivitiesChipsTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ActivitiesChipsText({ text, additionalClassNames = "" }: ActivitiesChipsTextProps) {
  return (
    <div className={clsx("absolute bg-[rgba(37,99,235,0.08)] h-[30px] rounded-[28px] top-[408px]", additionalClassNames)}>
      <div className="content-stretch flex items-center justify-center overflow-clip p-[10px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#2563eb] text-[14px] text-center whitespace-nowrap">{text}</p>
      </div>
      <div aria-hidden="true" className="absolute border border-[#2563eb] border-solid inset-0 pointer-events-none rounded-[28px]" />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-white overflow-clip relative rounded-bl-[20px] rounded-tl-[20px] size-full">
      <div className="absolute left-[31px] rounded-[80px] size-[126px] top-[93px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[80px] size-full" src={imgFrame24} />
      </div>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[220px] not-italic text-[#878e9e] text-[20px] top-[408px] whitespace-nowrap">Limited</p>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[222px] not-italic text-[#878e9e] text-[20px] top-[259px] whitespace-nowrap">Address 1: Unit No 8/a, Laxmi Indl.estate, Hanuman Galili, Maharashtra, India</p>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[222px] not-italic text-[#878e9e] text-[20px] top-[298px] whitespace-nowrap">Address 2: Unit No 8/a, Andheri, Hanuman Galili, Maharashtra, India</p>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[220px] not-italic text-[#878e9e] text-[20px] top-[531px] whitespace-nowrap">Software group</p>
      <div className="absolute content-stretch flex flex-col items-start left-[220px] top-[78px] w-[321.602px]">
        <div className="content-stretch flex flex-col items-start relative shrink-0 w-full">
          <div className="content-stretch flex flex-col gap-[5.358px] items-start relative shrink-0">
            <div className="content-stretch flex items-center justify-center relative shrink-0">
              <p className="font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[36px] not-italic relative shrink-0 text-[#0e1e3f] text-[28px] w-[297.146px]">Kapil Dev</p>
            </div>
            <div className="content-stretch flex items-center relative shrink-0">
              <p className="font-['Inter:Medium',sans-serif] font-medium leading-[32px] not-italic relative shrink-0 text-[#475569] text-[24px] whitespace-nowrap">Role: Software Engineer</p>
            </div>
          </div>
        </div>
      </div>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[220px] not-italic text-[#0e1e3f] text-[22px] top-[368px] whitespace-nowrap">Permission level</p>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[222px] not-italic text-[#0e1e3f] text-[22px] top-[222px] whitespace-nowrap">Address</p>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[220px] not-italic text-[#0e1e3f] text-[22px] top-[491px] whitespace-nowrap">Group</p>
      <div className="absolute contents left-[486px] top-[368px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[486px] not-italic text-[#0e1e3f] text-[22px] top-[368px] whitespace-nowrap">Permission Category</p>
        <div className="absolute contents left-[486px] top-[408px]">
          <ActivitiesChipsText text="Order creation" additionalClassNames="left-[486px] w-[143px]" />
          <ActivitiesChipsText text="See cart page" additionalClassNames="left-[638px] w-[145px]" />
          <ActivitiesChipsText text="Get order emails" additionalClassNames="left-[792px] w-[152px]" />
        </div>
      </div>
      <div className="absolute contents left-[220px] top-[614px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[220px] not-italic text-[#0e1e3f] text-[22px] top-[614px] whitespace-nowrap">Rewards/gifts</p>
      </div>
      <div className="absolute flex h-[1088px] items-center justify-center left-[182px] top-[78px] w-0" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "21" } as React.CSSProperties}>
        <div className="flex-none rotate-90">
          <div className="h-0 relative w-[1088px]">
            <div className="absolute inset-[-1px_0_0_0]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1088 1">
                <line id="Line 1209" stroke="var(--stroke-0, #ECECEC)" x2="1088" y1="0.5" y2="0.5" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-0 left-[220px] top-[187px] w-[843px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 843 1">
            <line id="Line 1212" stroke="var(--stroke-0, #ECECEC)" x2="843" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <div className="absolute contents left-0 top-[461px]">
        <div className="absolute bg-[#fbfbfb] h-[364px] left-0 top-[461px] w-[182px]" />
        <div className="absolute content-stretch flex flex-col gap-[28px] items-center left-[27px] top-[492px] w-[128px]">
          <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
            <p className="col-1 font-['Inter:Regular',sans-serif] font-normal leading-[normal] ml-0 mt-[44px] not-italic relative row-1 text-[14px] text-black text-center w-[123px]">+91 56151652156</p>
            <Wrapper1 additionalClassNames="ml-[46px]">
              <g id="PhoneCall">
                <path d={svgPaths.pafbc400} fill="var(--fill-0, #475569)" id="Vector" />
              </g>
            </Wrapper1>
          </div>
          <Helper />
          <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
            <p className="col-1 font-['Inter:Regular',sans-serif] font-normal leading-[normal] ml-0 mt-[44px] not-italic relative row-1 text-[14px] text-black text-center w-[123px]">Edward mail.com</p>
            <Wrapper1 additionalClassNames="ml-[46px]">
              <g id="Envelope">
                <path d={svgPaths.p3806de00} fill="var(--fill-0, #475569)" id="Vector" />
              </g>
            </Wrapper1>
          </div>
          <div className="flex items-center justify-center relative shrink-0">
            <div className="flex-none rotate-180">
              <Wrapper additionalClassNames="w-[128px]">
                <line id="Line 1214" stroke="var(--stroke-0, black)" strokeOpacity="0.2" x2="128" y1="0.5" y2="0.5" />
              </Wrapper>
            </div>
          </div>
          <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
            <p className="col-1 font-['Inter:Regular',sans-serif] font-normal leading-[normal] ml-0 mt-[46px] not-italic relative row-1 text-[14px] text-black text-center w-[123px]">10 Jan 1999</p>
            <Wrapper1 additionalClassNames="ml-[46.5px]">
              <g clipPath="url(#clip0_236_814)" id="Envelope">
                <g id="cake 1">
                  <path d={svgPaths.p14d5a900} fill="var(--fill-0, #475569)" id="Vector" />
                </g>
              </g>
              <defs>
                <clipPath id="clip0_236_814">
                  <rect fill="white" height="32" width="32" />
                </clipPath>
              </defs>
            </Wrapper1>
          </div>
        </div>
      </div>
      <div className="absolute flex items-center justify-center left-[36px] size-[38px] top-[24px]">
        <div className="flex-none rotate-180">
          <div className="relative size-[38px]" data-name="arrow_forward_FILL0_wght300_GRAD-25_opsz24 2">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 38 38">
              <g id="arrow_forward_FILL0_wght300_GRAD-25_opsz24 2">
                <path d={svgPaths.p3f23e400} fill="var(--fill-0, black)" id="Vector" />
              </g>
            </svg>
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[15px] items-center left-[30px] top-[247px] w-[128px]">
        <div className="font-['Inter:Regular',sans-serif] font-normal grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] not-italic place-items-start relative shrink-0 text-center">
          <p className="col-1 leading-[normal] ml-0 mt-[28px] relative row-1 text-[#878e9e] text-[14px] w-[123px]">Rewards/gifts</p>
          <p className="col-1 leading-[24px] ml-0 mt-0 relative row-1 text-[18px] text-black w-[123px]">8</p>
        </div>
        <Helper />
        <div className="font-['Inter:Regular',sans-serif] font-normal grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] not-italic place-items-start relative shrink-0 text-center">
          <p className="col-1 leading-[normal] ml-0 mt-[28px] relative row-1 text-[#878e9e] text-[14px] w-[123px]">Date of joining</p>
          <p className="col-1 leading-[24px] ml-[8px] mt-0 relative row-1 text-[18px] text-black whitespace-nowrap">24 Sep 2019</p>
        </div>
        <Helper />
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
          <div className="col-1 font-['Inter:Regular',sans-serif] font-normal grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 not-italic place-items-start relative row-1 text-center">
            <p className="col-1 leading-[normal] ml-0 mt-[28px] relative row-1 text-[#878e9e] text-[14px] w-[123px]">Experience</p>
            <p className="col-1 leading-[24px] ml-0 mt-0 relative row-1 text-[#0e1e3f] text-[18px] w-[123px]">5+ yrs</p>
          </div>
        </div>
      </div>
      <div className="absolute left-[1039px] opacity-40 overflow-clip size-[24px] top-[84px]" data-name="DotsThreeOutlineVertical">
        <div className="absolute inset-[6.25%_37.5%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 21">
            <path d={svgPaths.p1db0c800} fill="var(--fill-0, #878E9E)" id="Vector" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[1.5] left-[261px] text-[21.433px] text-[rgba(25,23,23,0.7)] top-[1242px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        Reason for gift: Diwali bonus
      </p>
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[1.5] left-[703px] text-[14.43px] text-[rgba(25,23,23,0.7)] top-[1184px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        Status: Received
      </p>
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[1.5] left-[261px] text-[14.43px] text-[rgba(25,23,23,0.7)] top-[1184px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        Date: 4 Nov 2019
      </p>
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[1.5] left-[261px] text-[14.43px] text-[rgba(25,23,23,0.7)] top-[1350px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        Date: 4 Nov 2019
      </p>
      <div className="absolute left-[222px] size-[30px] top-[1242px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
          <circle cx="15" cy="15" fill="var(--fill-0, #F4F4F4)" id="Ellipse 3283" r="15" />
        </svg>
      </div>
      <div className="absolute contents left-[222px] top-[665px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[261px] not-italic text-[#878e9e] text-[20px] top-[666px] whitespace-nowrap">Reason for gift: Promotion</p>
        <Helper1 additionalClassNames="top-[665px]" />
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[232px] not-italic text-[#ef4444] text-[20px] top-[666px] whitespace-nowrap">1</p>
      </div>
      <div className="absolute contents left-[222px] top-[950px]">
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[261px] not-italic text-[#878e9e] text-[20px] top-[951px] whitespace-nowrap">Reason for gift: Diwali celebration</p>
        <Helper1 additionalClassNames="top-[950px]" />
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[232px] not-italic text-[#ef4444] text-[20px] top-[951px] whitespace-nowrap">1</p>
      </div>
      <p className="absolute font-['DM_Sans:Medium',sans-serif] font-medium leading-[1.5] left-[233px] text-[21.433px] text-[rgba(25,23,23,0.7)] top-[1242px] whitespace-nowrap" style={{ fontVariationSettings: "'opsz' 14" }}>
        2
      </p>
      <div className="absolute contents left-[264px] top-[1290px]">
        <div className="absolute bg-white h-[164.368px] left-[264px] rounded-[8.358px] shadow-[0px_2.786px_5.572px_0px_rgba(0,0,0,0.12)] top-[1290px] w-[553px]" />
        <div className="absolute h-[143.474px] left-[275.14px] mix-blend-luminosity rounded-[4.875px] top-[1300.45px] w-[171.332px]">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-[4.875px]">
            <img alt="" className="absolute max-w-none object-cover rounded-[4.875px] size-full" src={imgRectangle34624814} />
            <div className="absolute bg-white inset-0 rounded-[4.875px]" />
          </div>
        </div>
        <Image additionalClassNames="left-[273.05px] mix-blend-luminosity top-[1323.43px]" />
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[1.6] left-[463.89px] not-italic text-[16.715px] text-black top-[1393.77px] tracking-[0.6686px] whitespace-nowrap">{`₹ 1500 / per piece `}</p>
        <div className="absolute contents leading-[1.6] left-[463.89px] not-italic top-[1303.93px] whitespace-nowrap">
          <p className="absolute font-['Inter:Medium',sans-serif] font-medium left-[463.89px] text-[20.894px] text-black top-[1303.93px] tracking-[0.8358px]">Welcome pack 01</p>
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal left-[463.89px] text-[#5c5c5c] text-[11.144px] top-[1337.36px] tracking-[0.4457px]">{`Discover seamless meetings at Ginger Goa Panjim's...`}</p>
        </div>
        <div className="absolute contents left-[463.89px] top-[1425.81px]">
          <div className="absolute contents left-[463.89px] top-[1425.81px]">
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[1.6] left-[544.68px] not-italic text-[#5c5c5c] text-[11.144px] top-[1425.81px] tracking-[0.4457px] whitespace-nowrap">4 stars</p>
            <Group1000004650Helper additionalClassNames="left-[463.89px]" />
            <Group1000004650Helper additionalClassNames="left-[482.69px]" />
            <Group1000004650Helper additionalClassNames="left-[501.5px]" />
            <Group1000004650Helper additionalClassNames="left-[520.3px]" />
          </div>
        </div>
        <div className="absolute content-stretch flex gap-[16.715px] h-[18.108px] items-start leading-[0] left-[463.89px] top-[1363.13px] w-[240.283px]">
          <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
            <p className="col-1 font-['Inter:Regular',sans-serif] font-normal leading-[1.6] ml-[19.5px] mt-0 not-italic relative row-1 text-[#2d2d2d] text-[11.144px] tracking-[0.4457px] whitespace-nowrap">Panjim, Goa</p>
            <Wrapper2>
              <g id="mdi:location">
                <path d={svgPaths.p3aa8c80} fill="var(--fill-0, #5E5E5E)" id="Vector" />
              </g>
            </Wrapper2>
          </div>
          <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid place-items-start relative shrink-0">
            <p className="col-1 font-['Inter:Regular',sans-serif] font-normal leading-[1.6] ml-[23.68px] mt-0 not-italic relative row-1 text-[#2d2d2d] text-[11.144px] tracking-[0.4457px] whitespace-pre">{`Max: 500   Min: 300`}</p>
            <Wrapper2>
              <g clipPath="url(#clip0_236_785)" id="ic:baseline-people">
                <path d={svgPaths.p2d5d680} fill="var(--fill-0, #606060)" id="Vector" />
              </g>
              <defs>
                <clipPath id="clip0_236_785">
                  <rect fill="white" height="16.7154" width="16.7154" />
                </clipPath>
              </defs>
            </Wrapper2>
          </div>
        </div>
        <div className="absolute bg-black h-[17.412px] left-[265.39px] rounded-br-[8.358px] top-[1291.39px] w-[78.702px]" />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.715px] left-[273.05px] not-italic text-[9.751px] text-white top-[1291.39px] tracking-[-0.1073px] whitespace-nowrap">Ongoing Offer</p>
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[261px] not-italic text-[#475569] text-[16px] top-[885px] whitespace-nowrap">Date: 4 Nov 2019</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[261px] not-italic text-[#475569] text-[16px] top-[1175px] whitespace-nowrap">Date: 4 Nov 2019</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[687px] not-italic text-[#475569] text-[16px] top-[885px] whitespace-nowrap">Status: Received</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[687px] not-italic text-[#475569] text-[16px] top-[1175px] whitespace-nowrap">Status: Received</p>
      <div className="absolute contents left-[261px] top-[709px]">
        <div className="absolute bg-white h-[164.368px] left-[261px] rounded-[8.358px] shadow-[0px_2.786px_5.572px_0px_rgba(0,0,0,0.12)] top-[709px] w-[553px]" />
        <Image additionalClassNames="left-[270.05px] top-[742.43px]" />
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[453px] not-italic text-[#0e1e3f] text-[20px] top-[748px] w-[312px]">Welcome pack 01</p>
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[453px] not-italic text-[#0e1e3f] text-[24px] top-[818px] whitespace-nowrap">₹400</p>
        <Helper2 additionalClassNames="top-[822px]" />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[453px] not-italic text-[#878e9e] text-[14px] top-[727px] whitespace-nowrap">{`RodZen `}</p>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[453px] not-italic text-[#475569] text-[14px] top-[782px] whitespace-nowrap">Pen, bag, thermal bottle keychain, diary</p>
        <div className="absolute bg-[rgba(0,0,0,0.1)] h-[164px] left-[261px] rounded-bl-[4.875px] rounded-tl-[4.875px] top-[709px] w-[177px]" />
      </div>
      <div className="absolute contents left-[261px] top-[999px]">
        <div className="absolute bg-white h-[164.368px] left-[261px] rounded-[8.358px] shadow-[0px_2.786px_5.572px_0px_rgba(0,0,0,0.12)] top-[999px] w-[553px]" />
        <div className="absolute h-[164px] left-[261px] rounded-bl-[4.875px] rounded-tl-[4.875px] top-[999px] w-[177px]">
          <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-bl-[4.875px] rounded-tl-[4.875px]">
            <div className="absolute inset-0 overflow-hidden rounded-bl-[4.875px] rounded-tl-[4.875px]">
              <img alt="" className="absolute h-[107.75%] left-[0.53%] max-w-none top-[-6.53%] w-[99.84%]" src={imgRectangle34624816} />
            </div>
            <div className="absolute bg-[rgba(0,0,0,0.1)] inset-0 rounded-bl-[4.875px] rounded-tl-[4.875px]" />
          </div>
        </div>
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[453px] not-italic text-[#0e1e3f] text-[20px] top-[1038px] w-[312px]">Welcome pack 01</p>
        <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[453px] not-italic text-[#0e1e3f] text-[24px] top-[1108px] whitespace-nowrap">₹400</p>
        <Helper2 additionalClassNames="top-[1112px]" />
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[453px] not-italic text-[#878e9e] text-[14px] top-[1017px] whitespace-nowrap">{`RodZen `}</p>
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[453px] not-italic text-[#475569] text-[14px] top-[1072px] whitespace-nowrap">Pen, bag, thermal bottle keychain, diary</p>
      </div>
      <Frame1973340910Helper additionalClassNames="top-[709px]" />
      <Frame1973340910Helper additionalClassNames="top-[999px]" />
      <div className="absolute bg-[#2563eb] content-stretch flex gap-[8px] h-[50px] items-center justify-center left-[835px] overflow-clip px-[87px] py-[14px] rounded-[60px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12)] top-[71px] w-[185px]" data-name="Buttton">
        <div className="relative shrink-0 size-[24px]" data-name="ph:pencil">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <g id="ph:pencil">
              <path d={svgPaths.pe1eab00} fill="var(--fill-0, white)" id="Vector" />
            </g>
          </svg>
        </div>
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[18px] text-center text-white whitespace-nowrap">Edit</p>
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)]" />
      </div>
    </div>
  );
}