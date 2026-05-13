import clsx from "clsx";
import svgPaths from "./svg-p2wsg233o4";
type Wrapper3Props = {
  additionalClassNames?: string;
};

function Wrapper3({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper3Props>) {
  return (
    <div className={clsx("size-[24px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}

function HelperbuttonHelper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
      <div className="content-stretch flex items-center justify-center px-[87px] py-[14px] relative size-full">{children}</div>
    </div>
  );
}

function Wrapper2({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-white h-[48px] relative rounded-[6px] shrink-0 w-full">
      <div className="overflow-clip relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border border-[#dde2e4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}
type Wrapper1Props = {
  additionalClassNames?: string;
};

function Wrapper1({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper1Props>) {
  return (
    <button className={additionalClassNames}>
      <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">{children}</div>
    </button>
  );
}
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return <Wrapper1 additionalClassNames={clsx("absolute cursor-pointer w-[462px]", additionalClassNames)}>{children}</Wrapper1>;
}
type InputWithLabelTextProps = {
  text: string;
  additionalClassNames?: string;
};

function InputWithLabelText({ text, additionalClassNames = "" }: InputWithLabelTextProps) {
  return (
    <Wrapper1 additionalClassNames={clsx("absolute cursor-pointer top-[354px] w-[462px]", additionalClassNames)}>
      <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] text-left whitespace-nowrap">{text}</p>
      <FormFieldsTextInputText1 text="Select date" />
    </Wrapper1>
  );
}
type Frame1973341944HelperProps = {
  additionalClassNames?: string;
};

function Frame1973341944Helper({ additionalClassNames = "" }: Frame1973341944HelperProps) {
  return (
    <div className={clsx("-scale-y-100 flex-none rotate-180 w-[999px]", additionalClassNames)}>
      <div className="bg-white rounded-[12px] shadow-[0px_6px_16px_0px_rgba(0,0,0,0.16)] size-full" />
    </div>
  );
}
type FrameProps = {
  additionalClassNames?: string;
};

function Frame({ additionalClassNames = "" }: FrameProps) {
  return (
    <div className={clsx("absolute size-[30px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Frame">
          <path d={svgPaths.p1d095600} fill="var(--fill-0, #878E9E)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}
type FormFieldsTextInputText1Props = {
  text: string;
};

function FormFieldsTextInputText1({ text }: FormFieldsTextInputText1Props) {
  return (
    <Wrapper2>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#878e9e] text-[16px] text-left top-[14px] whitespace-nowrap">{text}</p>
    </Wrapper2>
  );
}
type FormFieldsTextInputTextProps = {
  text: string;
};

function FormFieldsTextInputText({ text }: FormFieldsTextInputTextProps) {
  return (
    <Wrapper2>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#878e9e] text-[16px] text-left top-[14px] whitespace-nowrap">{text}</p>
      <div className="absolute h-[23.001px] right-[16px] top-[12px] w-[24.501px]">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.5008 23.001">
          <g id="Frame">
            <path d={svgPaths.p23254870} fill="var(--fill-0, black)" id="Vector" />
          </g>
        </svg>
      </div>
    </Wrapper2>
  );
}

export default function Frame1() {
  return (
    <div className="bg-white overflow-clip relative rounded-[12px] size-full">
      <div className="absolute bg-[#f6f6f8] h-[64px] left-0 opacity-80 top-0 w-[1119px]" />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[62px] not-italic text-[#0e1e3f] text-[22px] top-[16px] whitespace-nowrap">Adding a User</p>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[60px] not-italic text-[#475569] text-[18px] top-[96px] w-[953px]">
        <p className="leading-[24px]">Add user details to create a user. This will be added to the user listing.</p>
      </div>
      <button className="absolute block cursor-pointer left-[1069px] size-[24px] top-[20px]" data-name="ic:round-close">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <g id="ic:round-close">
            <path d={svgPaths.p2f1cedc0} fill="var(--fill-0, black)" id="Vector" />
          </g>
        </svg>
      </button>
      <div className="absolute contents left-0 top-[734px]">
        <div className="absolute bg-white h-[106px] left-0 shadow-[0px_-3px_11px_0px_rgba(0,0,0,0.11)] top-[734px] w-[1179px]" />
        <button className="absolute bg-[#2563eb] cursor-pointer h-[50px] left-[796px] rounded-[60px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12)] top-[762px] w-[264px]" data-name="Buttton">
          <HelperbuttonHelper>
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[18px] text-center text-white whitespace-nowrap">Add user</p>
          </HelperbuttonHelper>
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)]" />
        </button>
        <button className="absolute bg-white cursor-pointer h-[50px] left-[520px] rounded-[60px] top-[762px] w-[264px]" data-name="Buttton">
          <HelperbuttonHelper>
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#2563eb] text-[18px] text-center whitespace-nowrap">Cancel</p>
          </HelperbuttonHelper>
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)]" />
          <div aria-hidden="true" className="absolute border border-[#2563eb] border-solid inset-0 pointer-events-none rounded-[60px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12)]" />
        </button>
      </div>
      <div className="absolute contents left-[60px] top-[135px]">
        <div className="absolute h-0 left-[60px] top-[170px] w-[999px]">
          <div className="absolute inset-[-1px_0_0_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 999 1">
              <line id="Line 1542" opacity="0.36" stroke="var(--stroke-0, #878E9E)" x2="999" y1="0.5" y2="0.5" />
            </svg>
          </div>
        </div>
        <div className="absolute h-0 left-[542px] top-[170px] w-[101px]">
          <div className="absolute inset-[-3px_0_0_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 101 3">
              <line id="Line 1549" stroke="var(--stroke-0, #2563EB)" strokeWidth="3" x2="101" y1="1.5" y2="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-[43px] items-center leading-[28px] left-[79px] not-italic text-[20px] top-[135px] whitespace-nowrap">
          <p className="relative shrink-0 text-[#878e9e]">Personal details</p>
          <p className="relative shrink-0 text-[#878e9e]">Address</p>
          <p className="relative shrink-0 text-[#878e9e]">Permissions</p>
          <p className="relative shrink-0 text-[#2563eb]">Budget</p>
        </div>
      </div>
      <div className="absolute flex h-[256px] items-center justify-center left-[5.45%] right-[5.27%] top-[206px]">
        <Frame1973341944Helper additionalClassNames="h-[256px]" />
      </div>
      <div className="absolute flex h-[156px] items-center justify-center left-[5.45%] right-[5.27%] top-[549px]">
        <Frame1973341944Helper additionalClassNames="h-[156px]" />
      </div>
      <Wrapper additionalClassNames="left-[85px] top-[258px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] text-left whitespace-nowrap">Budget type</p>
        <FormFieldsTextInputText text="Select category" />
      </Wrapper>
      <Wrapper additionalClassNames="left-[85px] top-[606px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] text-left whitespace-nowrap">Points</p>
        <FormFieldsTextInputText text="Select Points" />
      </Wrapper>
      <InputWithLabelText text="Start date" additionalClassNames="left-[85px]" />
      <Frame additionalClassNames="right-[585px] top-[387px]" />
      <Wrapper additionalClassNames="left-[574px] top-[258px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] text-left whitespace-nowrap">{`Budget amount `}</p>
        <FormFieldsTextInputText1 text="Enter budget amount" />
      </Wrapper>
      <InputWithLabelText text="End date" additionalClassNames="left-[574px]" />
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[85px] not-italic text-[#475569] text-[18px] top-[234px] whitespace-nowrap">
        <p className="leading-[24px]">#budget 1</p>
      </div>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[85px] not-italic text-[#475569] text-[18px] top-[580px] whitespace-nowrap">
        <p className="leading-[24px]">#Points</p>
      </div>
      <div className="absolute flex items-center justify-center left-[1010px] size-[24px] top-[223px]">
        <div className="flex-none rotate-180">
          <Wrapper3 additionalClassNames="relative">
            <g clipPath="url(#clip0_233_204)" id="caret-down 13">
              <g id="Vector" />
              <path d="M19.5 9L12 16.5L4.5 9" id="Vector_2" stroke="var(--stroke-0, #475569)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </g>
            <defs>
              <clipPath id="clip0_233_204">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </Wrapper3>
        </div>
      </div>
      <div className="absolute contents left-[61px] top-[482px]">
        <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[89px] not-italic text-[#2563eb] text-[16px] top-[484px] whitespace-nowrap">Add more</p>
        <Wrapper3 additionalClassNames="absolute left-[61px] top-[482px]">
          <g id="plus (2) 1">
            <path d={svgPaths.pb35900} fill="var(--fill-0, #2563EB)" id="Vector" />
          </g>
        </Wrapper3>
      </div>
      <Frame additionalClassNames="right-[97px] top-[386px]" />
      <div className="absolute h-0 left-[64px] top-[532px] w-[1000px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1000 1">
            <line id="Line 1585" stroke="var(--stroke-0, #ECECEC)" x2="1000" y1="0.5" y2="0.5" />
          </svg>
        </div>
      </div>
      <div className="absolute bg-[#f6f6f8] font-['Inter:Regular',sans-serif] font-normal h-[72px] left-[590px] not-italic overflow-clip rounded-[6px] top-[606px] w-[440px]">
        <p className="absolute leading-[20px] left-[37px] text-[#475569] text-[16px] top-[9px] whitespace-nowrap">One point is equals to 500 rupees</p>
        <p className="absolute leading-[16px] left-[37px] text-[#878e9e] text-[12px] top-[30px] w-[388px]">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p>
      </div>
    </div>
  );
}