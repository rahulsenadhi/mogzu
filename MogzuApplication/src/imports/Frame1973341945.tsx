import clsx from "clsx";
import svgPaths from "./svg-w4bc18wswv";
import imgAvatar from "figma:asset/5c621f1539bd85478054d8d7af4ac0bac0a72fd1.png";
import imgEllipse978 from "figma:asset/1866054134f6a3c57930f21f41a0c5955df9b3c2.png";
import imgEllipse3282 from "figma:asset/6fe09f9e642fc50a138aed4a81002a7cb9813ed9.png";
import imgEllipse979 from "figma:asset/e598c936515c3a0ae1f2e58a43ab24f7cb3e9dd1.png";
import imgEllipse980 from "figma:asset/8afe8d9a226435fe3ef4a1aad7d4daf418dc8846.png";

function Group1000004823Helper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
      <div className="content-stretch flex items-center justify-center px-[87px] py-[14px] relative size-full">{children}</div>
    </div>
  );
}
type AvatarImage1Props = {
  additionalClassNames?: string;
};

function AvatarImage1({ children, additionalClassNames = "" }: React.PropsWithChildren<AvatarImage1Props>) {
  return (
    <div className={clsx("absolute left-[117px] rounded-[256px] size-[32px]", additionalClassNames)}>
      <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[256px] size-full" src={imgAvatar} />
      <div aria-hidden="true" className="absolute border border-[#c8c8c8] border-solid inset-0 pointer-events-none rounded-[256px]" />
      <div className="absolute inset-[3.13%]">{children}</div>
    </div>
  );
}
type Wrapper2Props = {
  additionalClassNames?: string;
};

function Wrapper2({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper2Props>) {
  return (
    <div style={{ "--transform-inner-width": "1185", "--transform-inner-height": "21" } as React.CSSProperties} className={additionalClassNames}>
      <div className="flex-none rotate-90">{children}</div>
    </div>
  );
}
type Wrapper1Props = {
  additionalClassNames?: string;
};

function Wrapper1({ children, additionalClassNames = "" }: React.PropsWithChildren<Wrapper1Props>) {
  return <Wrapper2 additionalClassNames={clsx("absolute flex items-center justify-center left-[1055.5px] top-[426px] w-0", additionalClassNames)}>{children}</Wrapper2>;
}

function Wrapper({ children }: React.PropsWithChildren<{}>) {
  return (
    <div className="relative shrink-0 size-[24px]">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
        {children}
      </svg>
    </div>
  );
}
type ButttonText1Props = {
  text: string;
  additionalClassNames?: string;
};

function ButttonText1({ text, additionalClassNames = "" }: ButttonText1Props) {
  return (
    <div className={clsx("absolute bg-white h-[42px] left-[870px] rounded-[60px] w-[144px]", additionalClassNames)}>
      <div className="flex flex-row items-center justify-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex gap-[8px] items-center justify-center px-[87px] py-[14px] relative size-full">
          <Wrapper>
            <g clipPath="url(#clip0_236_426)" id="trash 1">
              <g id="Vector" />
              <path d="M20.25 5.25H3.75" id="Vector_2" stroke="var(--stroke-0, #F73D31)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              <path d="M9.75 9.75V15.75" id="Vector_3" stroke="var(--stroke-0, #F73D31)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              <path d="M14.25 9.75V15.75" id="Vector_4" stroke="var(--stroke-0, #F73D31)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              <path d={svgPaths.p23bdb780} id="Vector_5" stroke="var(--stroke-0, #F73D31)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              <path d={svgPaths.p38c78bc0} id="Vector_6" stroke="var(--stroke-0, #F73D31)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            </g>
            <defs>
              <clipPath id="clip0_236_426">
                <rect fill="white" height="24" width="24" />
              </clipPath>
            </defs>
          </Wrapper>
          <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#f73d31] text-[18px] text-center whitespace-nowrap">{text}</p>
        </div>
      </div>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)]" />
      <div aria-hidden="true" className="absolute border border-[#f73d31] border-solid inset-0 pointer-events-none rounded-[60px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12)]" />
    </div>
  );
}
type Group1000004826Helper1Props = {
  additionalClassNames?: string;
};

function Group1000004826Helper1({ additionalClassNames = "" }: Group1000004826Helper1Props) {
  return (
    <div className={clsx("absolute h-0 left-[101px] w-[791px]", additionalClassNames)}>
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 791 1">
          <line id="Line 264" opacity="0.8" stroke="var(--stroke-0, #E3E3E5)" strokeLinecap="round" x1="0.5" x2="790.5" y1="0.5" y2="0.5" />
        </svg>
      </div>
    </div>
  );
}
type Group1000004826HelperProps = {
  additionalClassNames?: string;
};

function Group1000004826Helper({ additionalClassNames = "" }: Group1000004826HelperProps) {
  return (
    <div className={clsx("absolute h-0 left-[101px] w-[934px]", additionalClassNames)}>
      <div className="absolute inset-[-1px_0_0_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 934 1">
          <line id="Line 260" opacity="0.8" stroke="var(--stroke-0, #E3E3E5)" strokeLinecap="round" x1="0.5" x2="933.5" y1="0.5" y2="0.5" />
        </svg>
      </div>
    </div>
  );
}
type HelperProps = {
  additionalClassNames?: string;
};

function Helper({ additionalClassNames = "" }: HelperProps) {
  return (
    <Wrapper2 additionalClassNames={clsx("absolute flex h-[42px] items-center justify-center top-[370px] w-0", additionalClassNames)}>
      <div className="h-0 relative w-[42px]">
        <div className="absolute inset-[-1px_0_0_0]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 42 1">
            <line id="Line 263" stroke="url(#paint0_linear_206_500)" x2="42" y1="0.5" y2="0.5" />
            <defs>
              <linearGradient gradientUnits="userSpaceOnUse" id="paint0_linear_206_500" x1="42" x2="9.48387" y1="2" y2="2">
                <stop stopColor="#D3D3D3" />
                <stop offset="0.3125" stopColor="#D3D3D3" stopOpacity="0.927083" />
                <stop offset="1" stopColor="#D3D3D3" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </Wrapper2>
  );
}
type AvatarImageProps = {
  additionalClassNames?: string;
};

function AvatarImage({ additionalClassNames = "" }: AvatarImageProps) {
  return (
    <div className={clsx("absolute left-[117px] pointer-events-none rounded-[256px] size-[32px]", additionalClassNames)}>
      <img alt="" className="absolute inset-0 max-w-none object-cover rounded-[256px] size-full" src={imgAvatar} />
      <div aria-hidden="true" className="absolute border border-[#c8c8c8] border-solid inset-0 rounded-[256px]" />
    </div>
  );
}
type CaretUpDownProps = {
  additionalClassNames?: string;
};

function CaretUpDown({ additionalClassNames = "" }: CaretUpDownProps) {
  return (
    <div className={clsx("absolute size-[14px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14 14">
        <g id="CaretUpDown">
          <path d={svgPaths.pb06c980} fill="var(--fill-0, #6C6C6C)" id="Vector" />
          <path d={svgPaths.p20aee080} fill="var(--fill-0, #D2D2D2)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}
type ButttonTextProps = {
  text: string;
  additionalClassNames?: string;
};

function ButttonText({ text, additionalClassNames = "" }: ButttonTextProps) {
  return (
    <div className={clsx("absolute bg-[#2563eb] content-stretch flex gap-[8px] h-[50px] items-center justify-center overflow-clip px-[87px] py-[14px] rounded-[60px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12)]", additionalClassNames)}>
      <Wrapper>
        <g id="plus (2) 2">
          <path d={svgPaths.pb35900} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </Wrapper>
      <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[18px] text-center text-white whitespace-nowrap">{text}</p>
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)]" />
    </div>
  );
}

export default function Frame() {
  return (
    <div className="bg-white overflow-clip relative rounded-[12px] size-full">
      <div className="absolute bg-[#f6f6f8] h-[64px] left-0 opacity-80 top-0 w-[1119px]" />
      <p className="absolute font-['Inter:Medium',sans-serif] font-medium leading-[32px] left-[62px] not-italic text-[#0e1e3f] text-[22px] top-[16px] whitespace-nowrap">Manage groups</p>
      <div className="-translate-y-1/2 absolute flex flex-col font-['Inter:Regular',sans-serif] font-normal justify-center leading-[0] left-[61px] not-italic text-[#475569] text-[18px] top-[121px] whitespace-nowrap">
        <p className="leading-[24px]">Add and manage teammates for better work efficiency</p>
      </div>
      <button className="absolute block cursor-pointer left-[1069px] size-[24px] top-[20px]" data-name="ic:round-close">
        <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
          <g id="ic:round-close">
            <path d={svgPaths.p2f1cedc0} fill="var(--fill-0, black)" id="Vector" />
          </g>
        </svg>
      </button>
      <ButttonText text="Create a group" additionalClassNames="left-[803px] top-[96px] w-[256px]" />
      <ButttonText text="Add user to this group" additionalClassNames="left-[752px] top-[255px] w-[264px]" />
      <div className="absolute contents left-[62px] top-[189px]">
        <div className="absolute h-0 left-[62px] top-[224px] w-[999px]">
          <div className="absolute inset-[-1px_0_0_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 999 1">
              <line id="Line 1542" opacity="0.36" stroke="var(--stroke-0, #878E9E)" x2="999" y1="0.5" y2="0.5" />
            </svg>
          </div>
        </div>
        <div className="absolute h-0 left-[62px] top-[224px] w-[190px]">
          <div className="absolute inset-[-3px_0_0_0]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 190 3">
              <line id="Line 1549" stroke="var(--stroke-0, #2563EB)" strokeWidth="3" x2="190" y1="1.5" y2="1.5" />
            </svg>
          </div>
        </div>
        <div className="absolute content-stretch flex font-['Inter:Medium',sans-serif] font-medium gap-[43px] items-center leading-[28px] left-[81px] not-italic text-[20px] top-[189px]">
          <p className="relative shrink-0 text-[#2563eb] w-[153px]">Software group</p>
          <p className="relative shrink-0 text-[#878e9e] whitespace-nowrap">Software group 2</p>
          <p className="relative shrink-0 text-[#878e9e] whitespace-nowrap">Design Team</p>
          <p className="relative shrink-0 text-[#878e9e] whitespace-nowrap">Management team</p>
        </div>
      </div>
      <div className="absolute left-[1035px] opacity-40 overflow-clip size-[24px] top-[268px]" data-name="DotsThreeOutlineVertical">
        <div className="absolute inset-[6.25%_37.5%]" data-name="Vector">
          <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 6 21">
            <path d={svgPaths.p1db0c800} fill="var(--fill-0, #878E9E)" id="Vector" />
          </svg>
        </div>
      </div>
      <div className="absolute contents left-[57px] top-[353px]">
        <div className="absolute bg-white h-[623px] left-[57px] rounded-[8.15px] shadow-[0px_2.717px_6.792px_0px_rgba(0,0,0,0.1)] top-[353px] w-[1004px]" />
        <div className="absolute contents left-[101px] top-[370px]">
          <CaretUpDown additionalClassNames="left-[809px] top-[384px]" />
          <CaretUpDown additionalClassNames="left-[211px] top-[382px]" />
          <div className="absolute contents left-[101px] top-[370px]">
            <div className="absolute contents left-[117px] top-[379px]">
              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[117px] not-italic text-[#475569] text-[16px] top-[379px] w-[97px]">User name</p>
            </div>
            <Helper additionalClassNames="left-[101px]" />
            <div className="absolute contents left-[117px] top-[439px]">
              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[155px] not-italic right-[861px] text-[#0e1e3f] text-[18px] top-[443px]">Kapil Dev</p>
              <AvatarImage additionalClassNames="top-[439px]" />
            </div>
            <div className="absolute contents left-[117px] top-[515px]">
              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[155px] not-italic right-[884px] text-[#0e1e3f] text-[18px] top-[519px] whitespace-nowrap">Kapil Dev</p>
              <AvatarImage1 additionalClassNames="top-[515px]">
                <img alt="" className="absolute block max-w-none size-full" height="30" src={imgEllipse978} width="30" />
              </AvatarImage1>
            </div>
            <div className="absolute contents left-[117px] top-[591px]">
              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[155px] not-italic right-[884px] text-[#0e1e3f] text-[18px] top-[595px] whitespace-nowrap">Kapil Dev</p>
              <AvatarImage additionalClassNames="top-[591px]" />
            </div>
            <div className="absolute contents left-[117px] top-[748px]">
              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[155px] not-italic right-[884px] text-[#0e1e3f] text-[18px] top-[752px] whitespace-nowrap">Kapil Dev</p>
              <AvatarImage1 additionalClassNames="top-[748px]">
                <img alt="" className="absolute block max-w-none size-full" height="30" src={imgEllipse3282} width="30" />
              </AvatarImage1>
            </div>
            <div className="absolute contents left-[117px] top-[670px]">
              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[155px] not-italic right-[861px] text-[#0e1e3f] text-[18px] top-[674px]">Kapil Dev</p>
              <div className="absolute left-[117px] rounded-[256px] size-[32px] top-[670px]" data-name="Avatar">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[256px] size-full" src={imgAvatar} />
                <div aria-hidden="true" className="absolute border border-[#c8c8c8] border-solid inset-0 pointer-events-none rounded-[256px]" />
                <div className="absolute flex inset-[3.13%] items-center justify-center">
                  <div className="-scale-y-100 flex-none rotate-180 size-[30px]">
                    <div className="relative size-full">
                      <img alt="" className="absolute block max-w-none size-full" height="30" src={imgEllipse979} width="30" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute contents left-[117px] top-[909px]">
              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[155px] not-italic right-[884px] text-[#0e1e3f] text-[18px] top-[909px] whitespace-nowrap">Kapil Dev</p>
              <div className="absolute left-[117px] rounded-[256px] size-[32px] top-[911px]" data-name="Avatar">
                <img alt="" className="absolute inset-0 max-w-none object-cover pointer-events-none rounded-[256px] size-full" src={imgAvatar} />
                <div aria-hidden="true" className="absolute border border-[#c8c8c8] border-solid inset-0 pointer-events-none rounded-[256px]" />
                <div className="absolute inset-[-15.63%_3.13%_21.88%_3.13%]">
                  <img alt="" className="absolute block max-w-none size-full" height="30" src={imgEllipse980} width="30" />
                </div>
              </div>
            </div>
            <div className="absolute contents left-[117px] top-[826px]">
              <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[155px] not-italic right-[861px] text-[#0e1e3f] text-[18px] top-[830px]">Kapil Dev</p>
              <AvatarImage additionalClassNames="top-[826px]" />
            </div>
          </div>
          <div className="absolute contents left-[359px] top-[370px]">
            <div className="absolute contents left-[359px] top-[370px]">
              <div className="absolute contents left-[375px] top-[379px]">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[375px] not-italic text-[#475569] text-[16px] top-[379px] whitespace-nowrap">Roles</p>
              </div>
              <Helper additionalClassNames="left-[359px]" />
            </div>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[375px] not-italic right-[587px] text-[#0e1e3f] text-[18px] top-[443px] whitespace-nowrap">Software Engineer</p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[379px] not-italic right-[649px] text-[#0e1e3f] text-[18px] top-[752px] whitespace-nowrap">Designer II</p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[379px] not-italic right-[656px] text-[#0e1e3f] text-[18px] top-[909px] whitespace-nowrap">Associate</p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[375px] not-italic right-[660px] text-[#0e1e3f] text-[18px] top-[519px] whitespace-nowrap">Associate</p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[379px] not-italic right-[595px] text-[#0e1e3f] text-[18px] top-[830px] whitespace-nowrap">{`Human Resource `}</p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[375px] not-italic right-[587px] text-[#0e1e3f] text-[18px] top-[595px] whitespace-nowrap">Software Engineer</p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[376px] not-italic right-[667px] text-[#0e1e3f] text-[18px] top-[674px] whitespace-nowrap">Designer</p>
          </div>
          <div className="absolute contents left-[647px] top-[370px]">
            <div className="absolute contents left-[647px] top-[370px]">
              <div className="absolute contents left-[663px] top-[380px]">
                <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[20px] left-[663px] not-italic text-[#475569] text-[16px] top-[380px] whitespace-nowrap">Permission level</p>
              </div>
              <Helper additionalClassNames="left-[647px]" />
            </div>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[663px] not-italic right-[393px] text-[#0e1e3f] text-[18px] top-[444px] whitespace-nowrap">Limited</p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[667px] not-italic right-[389px] text-[#0e1e3f] text-[18px] top-[753px] whitespace-nowrap">Limited</p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[667px] not-italic right-[389px] text-[#0e1e3f] text-[18px] top-[910px] whitespace-nowrap">Limited</p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[663px] not-italic right-[393px] text-[#0e1e3f] text-[18px] top-[520px] whitespace-nowrap">Limited</p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[667px] not-italic right-[322px] text-[#0e1e3f] text-[18px] top-[831px] whitespace-nowrap">Full-permission</p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[663px] not-italic right-[393px] text-[#0e1e3f] text-[18px] top-[596px] whitespace-nowrap">Limited</p>
            <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[664px] not-italic right-[392px] text-[#0e1e3f] text-[18px] top-[675px] whitespace-nowrap">Limited</p>
          </div>
          <Group1000004826Helper additionalClassNames="top-[412px]" />
          <Group1000004826Helper additionalClassNames="top-[494px]" />
          <Group1000004826Helper additionalClassNames="top-[571px]" />
          <Group1000004826Helper additionalClassNames="top-[648px]" />
          <Group1000004826Helper1 additionalClassNames="top-[725px]" />
          <Group1000004826Helper1 additionalClassNames="top-[802px]" />
          <Group1000004826Helper1 additionalClassNames="top-[879px]" />
        </div>
      </div>
      <div className="absolute contents left-0 top-[814px]">
        <div className="absolute bg-white h-[106px] left-0 shadow-[0px_-3px_11px_0px_rgba(0,0,0,0.11)] top-[814px] w-[1179px]" />
        <div className="absolute bg-[#2563eb] h-[50px] left-[796px] rounded-[60px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12)] top-[842px] w-[264px]" data-name="Buttton">
          <Group1000004823Helper>
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[18px] text-center text-white whitespace-nowrap">Add user</p>
          </Group1000004823Helper>
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)]" />
        </div>
        <button className="absolute bg-white cursor-pointer h-[50px] left-[520px] rounded-[60px] top-[842px] w-[264px]" data-name="Buttton">
          <Group1000004823Helper>
            <p className="font-['Inter:Medium',sans-serif] font-medium leading-[normal] not-italic relative shrink-0 text-[#2563eb] text-[18px] text-center whitespace-nowrap">Cancel</p>
          </Group1000004823Helper>
          <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_-3px_4px_4.9px_0px_rgba(255,255,255,0.39)]" />
          <div aria-hidden="true" className="absolute border border-[#2563eb] border-solid inset-0 pointer-events-none rounded-[60px] shadow-[0px_4px_6.1px_0px_rgba(0,0,0,0.12)]" />
        </button>
      </div>
      <Wrapper1 additionalClassNames="h-[370px]">
        <div className="h-0 relative w-[370px]">
          <div className="absolute inset-[-1.5px_-0.41%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 373 3">
              <path d="M1.5 1.5H371.5" id="Line 1576" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.2" strokeWidth="3" />
            </svg>
          </div>
        </div>
      </Wrapper1>
      <Wrapper1 additionalClassNames="h-[169px]">
        <div className="h-0 relative w-[169px]">
          <div className="absolute inset-[-1.5px_-0.89%]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 172 3">
              <path d="M1.5 1.5H170.5" id="Line 1577" stroke="var(--stroke-0, black)" strokeLinecap="round" strokeOpacity="0.6" strokeWidth="3" />
            </svg>
          </div>
        </div>
      </Wrapper1>
      <ButttonText1 text="Remove" additionalClassNames="top-[434px]" />
      <ButttonText1 text="Remove" additionalClassNames="top-[511px]" />
      <ButttonText1 text="Remove" additionalClassNames="top-[588px]" />
      <ButttonText1 text="Remove" additionalClassNames="top-[665px]" />
      <ButttonText1 text="Remove" additionalClassNames="top-[742px]" />
      <div className="absolute bg-white h-[42px] left-[61px] rounded-[6px] top-[259px] w-[437px]" data-name="Search">
        <div className="overflow-clip relative rounded-[inherit] size-full">
          <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[24px] left-[42px] not-italic right-[4px] text-[#959595] text-[14px] top-[calc(50%-12px)] tracking-[-0.084px]">{`Search `}</p>
          <div className="-translate-y-1/2 absolute left-[12px] size-[24px] top-1/2" data-name="Frame">
            <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <g clipPath="url(#clip0_236_421)" id="Frame">
                <g id="Vector" />
                <path d={svgPaths.p452f780} id="Vector_2" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                <path d={svgPaths.p35d48f80} id="Vector_3" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </g>
              <defs>
                <clipPath id="clip0_236_421">
                  <rect fill="white" height="24" width="24" />
                </clipPath>
              </defs>
            </svg>
          </div>
        </div>
        <div aria-hidden="true" className="absolute border border-[#dde2e4] border-solid inset-0 pointer-events-none rounded-[6px]" />
      </div>
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[normal] left-[61px] not-italic text-[#878e9e] text-[14px] top-[315px] whitespace-nowrap">20 total users</p>
    </div>
  );
}