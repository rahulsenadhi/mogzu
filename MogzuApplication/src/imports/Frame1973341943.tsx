import clsx from "clsx";
import svgPaths from "./svg-cyz8t3i6ia";
type Frame1973341943InputWithLabelProps = {
  additionalClassNames?: string;
};

function Frame1973341943InputWithLabel({ children, additionalClassNames = "" }: React.PropsWithChildren<Frame1973341943InputWithLabelProps>) {
  return (
    <button className={clsx("absolute cursor-pointer", additionalClassNames)}>
      <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">{children}</div>
    </button>
  );
}
type FormFieldsTextInputProps = {
  additionalClassNames?: string;
};

function FormFieldsTextInput({ children, additionalClassNames = "" }: React.PropsWithChildren<FormFieldsTextInputProps>) {
  return (
    <div className={clsx("bg-white relative rounded-[6px] shrink-0 w-full", additionalClassNames)}>
      <div className="overflow-clip relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border border-[#dde2e4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
      <div className="content-stretch flex items-center justify-center px-[87px] py-[14px] relative size-full">{children}</div>
    </div>
  );
}
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("size-[16px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
        {children}
      </svg>
    </div>
  );
}
type ActivitiesChipsTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ActivitiesChipsText({ text, additionalClassNames = "" }: ActivitiesChipsTextProps) {
  return (
    <div className={clsx("absolute bg-[rgba(37,99,235,0.08)] h-[30px] rounded-[28px]", additionalClassNames)}>
      <div className="content-stretch flex gap-[10px] items-center justify-center overflow-clip p-[10px] relative rounded-[inherit] size-full">
        <p className="font-['Inter:Medium',sans-serif] font-medium leading-[20px] not-italic relative shrink-0 text-[#2563eb] text-[14px] text-center whitespace-nowrap">{text}</p>
        <Wrapper additionalClassNames="relative shrink-0">
          <g id="x (6) 1">
            <path d={svgPaths.p174ee080} fill="var(--fill-0, #2563EB)" id="Vector" />
          </g>
        </Wrapper>
      </div>
      <div aria-hidden="true" className="absolute border border-[#2563eb] border-solid inset-0 pointer-events-none rounded-[28px]" />
    </div>
  );
}

function Frame() {
  return (
    <div className="absolute h-[23.001px] right-[16px] top-[12px] w-[24.501px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.5008 23.001">
        <g id="Frame">
          <path d={svgPaths.p23254870} fill="var(--fill-0, black)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}
type TextProps = {
  text: string;
};

function Text({ text }: TextProps) {
  return (
    <Wrapper1>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#2563eb] text-[18px] text-center whitespace-nowrap">{text}</p>
    </Wrapper1>
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
        <div className="absolute bg-[#2563eb] h-[50px] left-[796px] rounded-[60px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12)] top-[762px] w-[264px]" data-name="Buttton">
          <Wrapper1>
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[18px] text-center text-white whitespace-nowrap">Next</p>
          </Wrapper1>
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)]" />
        </div>
        <button className="absolute bg-white cursor-pointer h-[50px] left-[520px] rounded-[60px] top-[762px] w-[264px]" data-name="Buttton">
          <Text text="Cancel" />
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
        <div className="absolute h-0 left-[388px] top-[170px] w-[137px]">
          <div className="absolute inset-[-3px_0_0_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 137 3">
              <line id="Line 1549" stroke="var(--stroke-0, #2563EB)" strokeWidth="3" x2="137" y1="1.5" y2="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-[43px] items-center leading-[28px] left-[79px] not-italic text-[20px] top-[135px] whitespace-nowrap">
          <p className="relative shrink-0 text-[#878e9e]">Personal details</p>
          <p className="relative shrink-0 text-[#878e9e]">Address</p>
          <p className="relative shrink-0 text-[#2563eb]">Permissions</p>
          <p className="relative shrink-0 text-[#878e9e]">Budget</p>
        </div>
      </div>
      <Frame1973341943InputWithLabel additionalClassNames="left-[60px] top-[206px] w-[468px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] text-left whitespace-nowrap">Permission level*</p>
        <FormFieldsTextInput additionalClassNames="h-[48px]">
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#878e9e] text-[16px] text-left top-[14px] whitespace-nowrap">Select permission level</p>
          <Frame />
        </FormFieldsTextInput>
      </Frame1973341943InputWithLabel>
      <div className="absolute content-stretch flex flex-col gap-[4px] items-start left-[592px] top-[206px] w-[468px]" data-name="Input with label">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] whitespace-nowrap">Access to categories*</p>
        <FormFieldsTextInput additionalClassNames="h-[95px]">
          <ActivitiesChipsText text="Order creation" additionalClassNames="left-[16px] top-[14px] w-[143px]" />
          <ActivitiesChipsText text="See cart page" additionalClassNames="left-[168px] top-[14px] w-[145px]" />
          <ActivitiesChipsText text="Get order emails" additionalClassNames="left-[16px] top-[53px] w-[152px]" />
          <div className="absolute contents left-[429px] top-[15px]">
            <div className="absolute left-[429px] size-[24px] top-[15px]">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" fill="var(--fill-0, white)" id="Ellipse 3379" r="11.5" stroke="var(--stroke-0, #2563EB)" />
              </svg>
            </div>
            <Wrapper additionalClassNames="absolute left-[433px] top-[19px]">
              <g id="x (6) 2">
                <path d={svgPaths.p174ee080} fill="var(--fill-0, #2563EB)" id="Vector" />
              </g>
            </Wrapper>
          </div>
        </FormFieldsTextInput>
      </div>
      <div className="absolute content-stretch flex gap-[6px] items-center left-[60px] top-[348px]">
        <p className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Medium',sans-serif] font-medium leading-[1.4] not-italic relative shrink-0 text-[#2563eb] text-[16px] underline whitespace-nowrap">Add more details</p>
        <div className="relative shrink-0 size-[20px]" data-name="caret-down 11">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
            <g clipPath="url(#clip0_225_172)" id="caret-down 11">
              <g id="Vector" />
              <path d="M16.25 7.5L10 13.75L3.75 7.5" id="Vector_2" stroke="var(--stroke-0, #2563EB)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </g>
            <defs>
              <clipPath id="clip0_225_172">
                <rect fill="white" height="20" width="20" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute content-stretch flex items-center left-[60px] top-[294px]">
        <p className="[text-decoration-skip-ink:none] decoration-solid font-['Inter:Medium',sans-serif] font-medium leading-[1.4] not-italic relative shrink-0 text-[#2563eb] text-[16px] underline whitespace-nowrap">+ Add more</p>
      </div>
      <div className="absolute bg-white h-[48px] left-[924px] rounded-[60px] top-[364px] w-[136px]" data-name="Buttton">
        <Text text="Add" />
        <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)]" />
        <div aria-hidden="true" className="absolute border border-[#2563eb] border-solid inset-0 pointer-events-none rounded-[60px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12)]" />
      </div>
      <Frame1973341943InputWithLabel additionalClassNames="left-[592px] top-[341px] w-[326px]">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] text-left whitespace-nowrap">Categories</p>
        <FormFieldsTextInput additionalClassNames="h-[48px]">
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#878e9e] text-[16px] text-left top-[14px] w-[462.499px]">Select categories</p>
          <Frame />
        </FormFieldsTextInput>
      </Frame1973341943InputWithLabel>
    </div>
  );
}