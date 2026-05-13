import clsx from "clsx";
import svgPaths from "./svg-25p2406i03";
import imgImage2742 from "figma:asset/3343fab6d9b912e4151b80a43a23a01889ac749c.png";
import imgFrame26 from "figma:asset/f89db83641bb906adb1604f260e8fe4b09ed6652.png";

function Group1000004823Helper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
      <div className="content-stretch flex items-center justify-center px-[87px] py-[14px] relative size-full">{children}</div>
    </div>
  );
}

function Wrapper1({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="bg-white h-[48px] relative rounded-[6px] shrink-0 w-full">
      <div className="overflow-clip relative rounded-[inherit] size-full">{children}</div>
      <div aria-hidden="true" className="absolute border border-[#dde2e4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <button className={clsx("relative shrink-0", additionalClassNames)}>
      <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">{children}</div>
    </button>
  );
}
type FrameProps = {
  additionalClassNames?: string;
};

function Frame({ additionalClassNames = "" }: FrameProps) {
  return (
    <div className={clsx("absolute size-[30px] top-[458px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 30 30">
        <g id="Frame">
          <path d={svgPaths.p1d095600} fill="var(--fill-0, #878E9E)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}
type InputWithLabelTextProps = {
  text: string;
  additionalClassNames?: string;
};

function InputWithLabelText({ text, additionalClassNames = "" }: InputWithLabelTextProps) {
  return (
    <button className={clsx("relative shrink-0 w-full", additionalClassNames)}>
      <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">
        <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] text-left whitespace-nowrap">{text}</p>
        <FormFieldsTextInputText text="Select date" />
      </div>
    </button>
  );
}
type FormFieldsTextInputTextProps = {
  text: string;
};

function FormFieldsTextInputText({ text }: FormFieldsTextInputTextProps) {
  return (
    <Wrapper1>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#878e9e] text-[16px] text-left top-[14px] whitespace-nowrap">{text}</p>
    </Wrapper1>
  );
}

export default function Frame1() {
  return (
    <div className="bg-white overflow-clip relative rounded-[12px] size-full">
      <div className="absolute content-stretch flex flex-col gap-[24px] items-start left-[591px] top-[329px] w-[469px]">
        <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="_Input field">
          <div className="content-stretch flex flex-col gap-[6px] items-start relative shrink-0 w-full" data-name="Input with label">
            <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] whitespace-nowrap">Contact number*</p>
            <div className="bg-white relative rounded-[6px] shrink-0 w-full" data-name="Input">
              <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                <div className="content-stretch flex items-center px-[16px] py-[11px] relative w-full">
                  <div className="flex-[1_0_0] h-[24px] min-h-px min-w-px relative" data-name="Content">
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[32px] not-italic text-[#363c48] text-[16px] top-0 w-[32px]">+91</p>
                    <div className="absolute left-[68px] size-[18px] top-[3px]" data-name="CaretDown">
                      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 18">
                        <g id="CaretDown">
                          <path d={svgPaths.p31f4cf00} fill="var(--fill-0, #5E687E)" id="Vector" />
                        </g>
                      </svg>
                    </div>
                    <div className="absolute h-[24px] left-[97px] top-0 w-0">
                      <div className="absolute inset-[0_-0.5px]">
                        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 24">
                          <path d="M0.5 0V24" id="Vector 66" stroke="var(--stroke-0, #919BB0)" />
                        </svg>
                      </div>
                    </div>
                    <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[109px] not-italic text-[#878e9e] text-[16px] top-[1.5px] whitespace-nowrap">Enter user contact</p>
                    <div className="absolute h-[16px] left-0 top-[4px] w-[24px]" data-name="image 2742">
                      <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <img alt="" className="absolute h-[126.26%] left-[-5.36%] max-w-none top-[-13.13%] w-[108.93%]" src={imgImage2742} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div aria-hidden="true" className="absolute border border-[#dde2e4] border-solid inset-0 pointer-events-none rounded-[6px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)]" />
            </div>
          </div>
        </div>
        <InputWithLabelText text="Birthday" additionalClassNames="cursor-pointer" />
        <Wrapper additionalClassNames="cursor-pointer w-[468px]">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] text-left whitespace-nowrap">Add to group</p>
          <Wrapper1>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#878e9e] text-[16px] text-left top-[14px] whitespace-nowrap">Select</p>
            <div className="absolute h-[23.001px] right-[16px] top-[12px] w-[24.501px]" data-name="Frame">
              <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.5008 23.001">
                <g id="Frame">
                  <path d={svgPaths.p23254870} fill="var(--fill-0, black)" id="Vector" />
                </g>
              </svg>
            </div>
          </Wrapper1>
        </Wrapper>
      </div>
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
      <div className="absolute left-[60px] rounded-[80px] size-[104px] top-[200px]">
        <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[80px] size-full" src={imgFrame26} />
      </div>
      <button className="absolute cursor-pointer left-[591px] top-[210px] w-[468px]" data-name="Input with label">
        <div className="content-stretch flex flex-col gap-[4px] items-start relative w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] text-left whitespace-nowrap">User Name*</p>
          <Wrapper1>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[16px] not-italic text-[#0e1e3f] text-[16px] text-left top-[14px] whitespace-nowrap">Kapil Dev</p>
          </Wrapper1>
        </div>
      </button>
      <div className="absolute content-stretch cursor-pointer flex flex-col gap-[24px] items-start left-[60px] top-[329px] w-[469px]">
        <Wrapper additionalClassNames="w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] text-left whitespace-nowrap">Email ID*</p>
          <FormFieldsTextInputText text="Enter user email id" />
        </Wrapper>
        <InputWithLabelText text="Date of Joining" />
        <Wrapper additionalClassNames="w-full">
          <p className="font-['Inter:Regular',sans-serif] font-normal leading-[20px] not-italic relative shrink-0 text-[#0e1e3f] text-[16px] text-left whitespace-nowrap">Role</p>
          <FormFieldsTextInputText text="Enter role" />
        </Wrapper>
      </div>
      <Frame additionalClassNames="right-[613px]" />
      <Frame additionalClassNames="right-[82px]" />
      <div className="absolute contents left-[143px] top-[262px]">
        <div className="absolute contents left-[143px] top-[262px]">
          <div className="absolute left-[143px] size-[42px] top-[262px]">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 42">
              <g id="Group 1000003734">
                <circle cx="21" cy="21" fill="var(--fill-0, #2563EB)" id="Ellipse 3056" r="21" />
              </g>
            </svg>
          </div>
        </div>
        <div className="absolute inset-[32.26%_84.27%_64.88%_13.58%]" data-name="camera 1">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
            <g clipPath="url(#clip0_215_259)" id="camera 1">
              <g id="Vector" />
              <path d={svgPaths.p3389a2f0} id="Vector_2" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              <path d={svgPaths.p33c12a40} id="Vector_3" stroke="var(--stroke-0, white)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </g>
            <defs>
              <clipPath id="clip0_215_259">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </svg>
        </div>
      </div>
      <div className="absolute contents left-0 top-[734px]">
        <div className="absolute bg-white h-[106px] left-0 shadow-[0px_-3px_11px_0px_rgba(0,0,0,0.11)] top-[734px] w-[1179px]" />
        <div className="absolute bg-[#2563eb] h-[50px] left-[796px] rounded-[60px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12)] top-[762px] w-[264px]" data-name="Buttton">
          <Group1000004823Helper>
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[18px] text-center text-white whitespace-nowrap">Next</p>
          </Group1000004823Helper>
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)]" />
        </div>
        <button className="absolute bg-white cursor-pointer h-[50px] left-[520px] rounded-[60px] top-[762px] w-[264px]" data-name="Buttton">
          <Group1000004823Helper>
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#2563eb] text-[18px] text-center whitespace-nowrap">Cancel</p>
          </Group1000004823Helper>
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
        <div className="absolute h-0 left-[60px] top-[170px] w-[190px]">
          <div className="absolute inset-[-3px_0_0_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 190 3">
              <line id="Line 1549" stroke="var(--stroke-0, #2563EB)" strokeWidth="3" x2="190" y1="1.5" y2="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-[43px] items-center leading-[28px] left-[79px] not-italic text-[20px] top-[135px] whitespace-nowrap">
          <p className="relative shrink-0 text-[#2563eb]">Personal details</p>
          <p className="relative shrink-0 text-[#878e9e]">Address</p>
          <p className="relative shrink-0 text-[#878e9e]">Permissions</p>
          <p className="relative shrink-0 text-[#878e9e]">Budget</p>
        </div>
      </div>
    </div>
  );
}