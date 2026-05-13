import clsx from "clsx";
import svgPaths from "./svg-kr826i6pl5";
import imgImage24855 from "figma:asset/97572b310bf103bcd94545d382d4a4a7ba1f9ce4.png";
import imgEllipse3376 from "figma:asset/2272f81e0d87c3877b9b16f55482f17a12ec3e64.png";
type PlusProps = {
  additionalClassNames?: string;
};

function Plus({ children, additionalClassNames = "" }: React.PropsWithChildren<PlusProps>) {
  return (
    <div className={clsx("size-[24px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}
type RegestrationImageImageProps = {
  additionalClassNames?: string;
};

function RegestrationImageImage({ additionalClassNames = "" }: RegestrationImageImageProps) {
  return (
    <div className={clsx("absolute left-[603px] opacity-20 size-[41px]", additionalClassNames)}>
      <div className="absolute inset-0 opacity-90 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[128.32%] left-[-11%] max-w-none top-[-11.53%] w-[122.49%]" src={imgImage24855} />
      </div>
    </div>
  );
}
type RegestrationHelperProps = {
  text: string;
  text1: string;
  additionalClassNames?: string;
};

function RegestrationHelper({ text, text1, additionalClassNames = "" }: RegestrationHelperProps) {
  return (
    <p style={{ fontVariationSettings: "'wdth' 100" }} className={clsx("-translate-x-1/2 absolute font-['Open_Sans:Regular',sans-serif] font-normal leading-[0] left-[calc(50%-336.5px)] text-[#525252] text-[0px] text-center w-[251px]", additionalClassNames)}>
      <span className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Medium',sans-serif] font-medium leading-[1.4] not-italic text-[#2563eb] text-[16px] underline">{text}</span>
      <span className="leading-[normal] text-[18px]">{` `}</span>
      <span className="font-['Inter:Regular',sans-serif] leading-[20px] not-italic text-[#666c89] text-[16px]">{text1}</span>
    </p>
  );
}
type Text2Props = {
  text: string;
  additionalClassNames?: string;
};

function Text2({ text, additionalClassNames = "" }: Text2Props) {
  return (
    <div className={clsx("col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid mt-0 place-items-start relative row-1", additionalClassNames)}>
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal leading-[24px] ml-0 mt-0 not-italic relative row-1 text-[#475569] text-[18px] whitespace-nowrap">{text}</p>
      <FormFieldsTextInputText text="Paste the link" additionalClassNames="w-[140px]" />
    </div>
  );
}
type Text1Props = {
  text: string;
  additionalClassNames?: string;
};

function Text1({ text, additionalClassNames = "" }: Text1Props) {
  return (
    <div className={clsx("col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid mt-0 place-items-start relative row-1", additionalClassNames)}>
      <p className="col-1 font-['Inter:Regular',sans-serif] font-normal leading-[20px] ml-0 mt-0 not-italic relative row-1 text-[#0e1e3f] text-[16px] whitespace-nowrap">{text}</p>
      <FormFieldsTextInputText text="Paste the link" additionalClassNames="w-[140px]" />
    </div>
  );
}

function Helper() {
  return (
    <svg fill="none" preserveAspectRatio="none" viewBox="0 0 24 24" className="absolute block size-full">
      <g id="Frame">
        <path d={svgPaths.p35448c80} fill="var(--fill-0, #0E1E3F)" id="Vector" />
      </g>
    </svg>
  );
}
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return (
    <div className="content-stretch flex items-center overflow-clip px-[16px] py-[11px] relative rounded-[inherit] size-full">
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#878e9e] text-[16px] whitespace-nowrap">{text}</p>
    </div>
  );
}
type FormFieldsTextInputTextProps = {
  text: string;
  additionalClassNames?: string;
};

function FormFieldsTextInputText({ text, additionalClassNames = "" }: FormFieldsTextInputTextProps) {
  return (
    <div className={clsx("bg-white col-1 h-[48px] ml-0 mt-[24px] relative rounded-[6px] row-1", additionalClassNames)}>
      <Text text={text} />
      <div aria-hidden="true" className="absolute border border-[#dde2e4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

export default function Regestration() {
  return (
    <div className="bg-white relative size-full" data-name="Regestration">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[0] left-[437px] not-italic text-[#0e1e3f] text-[28px] top-[79px] whitespace-nowrap">
        <span className="leading-[36px]">{`👋 Hi John, `}</span>
        <span className="leading-[36px] text-[#878e9e]">{`Start your journey with Mogzu `}</span>
      </p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[437px] not-italic text-[#475569] text-[18px] top-[167px] w-[550px]">Step 2: Enter your business details.</p>
      <div className="absolute h-0 left-[436px] top-[269px] w-[1054px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1054 1">
            <line id="Line 6" stroke="var(--stroke-0, #CBD5E1)" x2="1054" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <div className="absolute h-0 left-[1260px] top-[269px] w-[220px]">
        <div className="absolute inset-[-3px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 220 3">
            <line id="Line 7" stroke="var(--stroke-0, #2563EB)" strokeWidth="3" x2="220" y1="1.5" y2="1.5" />
          </svg>
        </div>
      </div>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[437px] not-italic text-[#0e1e3f] text-[22px] top-[297px] whitespace-nowrap">Start adding details for your event service or add them later</p>
      <div className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[1666px] not-italic text-[#0e1e3f] text-[22px] top-[560px] whitespace-nowrap whitespace-pre">
        <p className="mb-0">Name</p>
        <p className="mb-0">description</p>
        <p className="mb-0">location</p>
        <p className="mb-0">Max capacity</p>
        <p className="mb-0">price</p>
        <p className="mb-0">map location</p>
        <p className="mb-0">amenities</p>
        <p className="mb-0">{`Portfolio `}</p>
        <p>Payment details</p>
      </div>
      <div className="-translate-x-1/2 absolute content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-[169px] items-start leading-[28px] left-[calc(50%+0.5px)] not-italic text-[20px] top-[221px] whitespace-nowrap">
        <p className="relative shrink-0 text-[#878e9e]">Personal</p>
        <p className="relative shrink-0 text-[#878e9e]">Business details</p>
        <p className="relative shrink-0 text-[#878e9e]">Service</p>
        <p className="relative shrink-0 text-[#2563eb]">Add your services</p>
      </div>
      <div className="absolute bg-[#2563eb] content-stretch flex gap-[8px] h-[50px] items-center justify-center left-[1224px] overflow-clip px-[87px] py-[14px] rounded-[60px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12)] top-[300px] w-[256px]" data-name="Buttton">
        <Plus additionalClassNames="relative shrink-0">
          <g id="plus (2) 2">
            <path d={svgPaths.pb35900} fill="var(--fill-0, white)" id="Vector" />
          </g>
        </Plus>
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[18px] text-center text-white whitespace-nowrap">Bulk upload</p>
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)]" />
      </div>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[437px] not-italic text-[#0e1e3f] text-[20px] top-[389px] whitespace-nowrap">Add manually</p>
      <div className="absolute bg-[#fbfbfb] border border-[#ececec] border-solid h-[1314px] left-[437px] rounded-[6px] top-[427px] w-[1043px]" />
      <div className="absolute content-stretch flex flex-col gap-[4px] items-start left-[1616px] top-[391px] w-[232px]" data-name="Input with label">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] whitespace-nowrap">Name</p>
        <div className="bg-white h-[48px] relative rounded-[6px] shrink-0 w-[232px]" data-name="Form Fields/Text input">
          <Text text="Enter name" />
          <div aria-hidden="true" className="absolute border border-[#dde2e4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
        </div>
      </div>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[471px] not-italic text-[#0e1e3f] text-[20px] top-[444px] whitespace-nowrap">Space 1</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[476px] not-italic text-[#475569] text-[18px] top-[509px] whitespace-nowrap">Overview</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[476px] not-italic text-[#475569] text-[18px] top-[1055px] whitespace-nowrap">Amenities</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[476px] not-italic text-[#0e1e3f] text-[18px] top-[1221px] whitespace-nowrap">Portfolio</p>
      <div className="absolute contents left-[153px] top-[705px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[181px] not-italic text-[#2563eb] text-[16px] top-[707px] whitespace-nowrap">Add another recipient</p>
        <Plus additionalClassNames="absolute left-[153px] top-[705px]">
          <g id="plus (2) 1">
            <path d={svgPaths.pb35900} fill="var(--fill-0, #2563EB)" id="Vector" />
          </g>
        </Plus>
      </div>
      <div className="absolute right-[463px] size-[24px] top-[444px]" data-name="Frame">
        <Helper />
      </div>
      <div className="absolute contents left-[476px] top-[548px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[476px] not-italic right-[1334px] text-[#0e1e3f] text-[16px] top-[548px] whitespace-nowrap">Product image</p>
        <div className="absolute border-2 border-[#969696] border-dashed left-[476px] rounded-[4px] size-[295px] top-[584px]" />
      </div>
      <RegestrationHelper text="Click to add a file" text1="or drag and drop file here" additionalClassNames="top-[729px]" />
      <RegestrationImageImage additionalClassNames="top-[681px]" />
      <button className="absolute cursor-pointer left-[829px] top-[548px] w-[578px]" data-name="Input with label">
        <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] text-left whitespace-nowrap">Name of the space</p>
          <div className="bg-white h-[48px] relative rounded-[6px] shrink-0 w-full" data-name="Form Fields/Text input">
            <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
              <div className="content-stretch flex items-center px-[16px] py-[11px] relative size-full">
                <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#878e9e] text-[16px] text-left whitespace-nowrap">Enter name of the space</p>
              </div>
            </div>
            <div aria-hidden="true" className="absolute border border-[#dde2e4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
          </div>
        </div>
      </button>
      <div className="absolute content-stretch flex flex-col items-start left-[829px] top-[807px] w-[578px]" data-name="Input with label">
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
          <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
            <p className="col-1 font-['Inter:Regular',sans-serif] font-normal leading-[20px] ml-0 mt-0 not-italic relative row-1 text-[#0e1e3f] text-[16px] whitespace-nowrap">Location</p>
            <FormFieldsTextInputText text="Enter name of the space" additionalClassNames="w-[282px]" />
          </div>
          <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-[294px] mt-0 place-items-start relative row-1">
            <p className="col-1 font-['Inter:Regular',sans-serif] font-normal leading-[20px] ml-0 mt-0 not-italic relative row-1 text-[#0e1e3f] text-[16px] whitespace-nowrap">Map Location (link)</p>
            <FormFieldsTextInputText text="Paste the link" additionalClassNames="w-[282px]" />
          </div>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col items-start left-[476px] top-[920px] w-[931px]" data-name="Input with label">
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
          <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
            <p className="col-1 font-['Inter:Regular',sans-serif] font-normal ml-0 mt-0 not-italic relative row-1 text-[#0e1e3f] text-[16px] whitespace-nowrap">
              <span className="leading-[20px]">{`Max capacity `}</span>
              <span className="leading-[20px] text-[#878e9e]">(optional)</span>
            </p>
            <FormFieldsTextInputText text="Enter max capacity" additionalClassNames="w-[250px]" />
          </div>
          <Text1 text="Standing" additionalClassNames="ml-[280px]" />
          <Text1 text="Parliament" additionalClassNames="ml-[450px]" />
          <Text2 text="Block" additionalClassNames="ml-[620px]" />
          <Text2 text="Boarding room" additionalClassNames="ml-[790px]" />
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col items-start left-[477px] top-[1101px] w-[931px]" data-name="Input with label">
        <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0">
          <div className="col-1 grid-cols-[max-content] grid-rows-[max-content] inline-grid ml-0 mt-0 place-items-start relative row-1">
            <p className="col-1 font-['Inter:Regular',sans-serif] font-normal leading-[20px] ml-0 mt-0 not-italic relative row-1 text-[#0e1e3f] text-[16px] whitespace-nowrap">Select amenities</p>
            <FormFieldsTextInputText text="Select amenities" additionalClassNames="w-[931px]" />
            <div className="col-1 ml-[883px] mt-[36px] relative row-1 size-[24px]" data-name="Frame">
              <Helper />
            </div>
          </div>
        </div>
      </div>
      <div className="absolute h-0 left-[437px] top-[491px] w-[1043px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1043 1">
            <line id="Line 8" stroke="var(--stroke-0, #CBD5E1)" x2="1043" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <div className="absolute content-stretch flex flex-col gap-[4px] h-[139px] items-start left-[829px] top-[640px] w-[578px]" data-name="Form Fields">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] whitespace-nowrap">Short description</p>
        <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[6px] w-[578px]" data-name="Form Fields/Textarea input">
          <div className="overflow-clip relative rounded-[inherit] size-full">
            <div className="absolute bottom-[2px] right-[3px] size-[12px]" data-name="Resize indicator">
              <div className="absolute inset-[-0.63%_0_0_-0.63%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 12.0754 12.0754">
                  <g id="Resize indicator">
                    <path d={svgPaths.p1df11c0} id="Path" stroke="var(--stroke-0, #959595)" />
                  </g>
                </svg>
              </div>
            </div>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#878e9e] text-[16px] top-[11px] whitespace-nowrap">{`Add description `}</p>
          </div>
          <div aria-hidden="true" className="absolute border border-[#dde2e4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
        </div>
      </div>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[441px] not-italic text-[#0e1e3f] text-[24px] top-[1761px] whitespace-nowrap">Meet the host</p>
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[28px] left-[528px] not-italic text-[#0e1e3f] text-[20px] top-[1824px] whitespace-nowrap">Michiel</p>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[528px] not-italic text-[#475569] text-[18px] top-[1856px] whitespace-nowrap">The host is the expert for this space.</p>
      <div className="absolute left-[438px] size-[67px] top-[1818px]">
        <img alt="" className="absolute block max-w-none size-full" height="67" src={imgEllipse3376} width="67" />
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[446px] not-italic text-[#878e9e] text-[16px] top-[1905px] w-[591px]">{`Discover seamless meetings at Ginger Goa Panjim's 65 sq mt space, accommodating up to 40 guests. Set against the vibrant backdrop of Panjim, our meeting room combines modern amenities with serene surroundings, fostering productive discussions and presentations.`}</p>
      <div className="absolute contents left-[441px] top-[2011px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[0] left-[441px] not-italic text-[0px] text-[18px] text-black top-[2011px] whitespace-nowrap">
          <span className="leading-[24px] text-[#878e9e]">Contact:</span>
          <span className="leading-[24px]">{` `}</span>
          <span className="leading-[24px] text-[#0e1e3f]">8888909988</span>
        </p>
      </div>
      <div className="absolute contents left-[476px] top-[1258px]">
        <div className="absolute h-[183px] left-[476px] top-[1258px] w-[296px]">
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal inset-[0_51.35%_89.07%_0] leading-[20px] not-italic text-[#0e1e3f] text-[16px] whitespace-nowrap">Profile picture/logo</p>
        </div>
      </div>
      <div className="absolute border-[#c8c8c8] border-[1.5px] border-dashed h-[150px] left-[24.79%] right-[59.84%] rounded-[4px] top-[1291px]" />
      <RegestrationHelper text="Click to add a file" text1="or drag and drop file here" additionalClassNames="top-[1368px]" />
      <RegestrationImageImage additionalClassNames="top-[1320px]" />
    </div>
  );
}