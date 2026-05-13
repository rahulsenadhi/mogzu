import clsx from "clsx";
import svgPaths from "./svg-f6en6r8kzc";
import imgAvatar from "figma:asset/e67667939a12621af070c82a05583b9248a7c28e.png";
import imgImage24877 from "figma:asset/d016f8256f9617c2da6226bb1fd8682cacd46dae.png";
import imgImage25044 from "figma:asset/dadfffada22e1e8b91ef887b7c0330bf9112bfbe.png";
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
type WrapperProps = {
  additionalClassNames?: string;
};

function Wrapper({ children, additionalClassNames = "" }: React.PropsWithChildren<WrapperProps>) {
  return (
    <div className={clsx("relative shrink-0 size-[28px]", additionalClassNames)}>
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 28">
        {children}
      </svg>
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
    <Wrapper>
      <g id="Frame">{children}</g>
    </Wrapper>
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
          <g clipPath="url(#clip0_244_1317)" id="question (1) 1">
            <g id="Vector" />
            <path d={svgPaths.pb23fa80} id="Vector_2" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p1f657d00} fill="var(--fill-0, #959595)" id="Vector_3" />
            <path d={svgPaths.p2714a900} id="Vector_4" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
          <defs>
            <clipPath id="clip0_244_1317">
              <rect fill="white" height="32" width="32" />
            </clipPath>
          </defs>
        </TopNavHelper>
        <TopNavHelper additionalClassNames="relative shrink-0">
          <g clipPath="url(#clip0_244_1242)" id="Frame">
            <g id="Vector" />
            <path d={svgPaths.p2386b670} id="Vector_2" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
            <path d={svgPaths.p11ca82c0} id="Vector_3" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
          </g>
          <defs>
            <clipPath id="clip0_244_1242">
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
              <g clipPath="url(#clip0_244_1302)" id="Frame">
                <g id="Vector" />
                <path d="M19.5 9L12 16.5L4.5 9" id="Vector_2" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </g>
              <defs>
                <clipPath id="clip0_244_1302">
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
              <g clipPath="url(#clip0_244_1271)" id="Frame">
                <g id="Vector" />
                <path d={svgPaths.p452f780} id="Vector_2" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
                <path d={svgPaths.p35d48f80} id="Vector_3" stroke="var(--stroke-0, #959595)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" />
              </g>
              <defs>
                <clipPath id="clip0_244_1271">
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
            <g filter={isVariant2 ? "url(#filter0_di_244_1291)" : "url(#filter0_di_244_1252)"} id="Rectangle 24">
              <path d={isVariant2 ? svgPaths.p1ad2ef60 : svgPaths.p18e76f80} fill="white" />
              <path d={isVariant2 ? svgPaths.p7b2e700 : svgPaths.p1a9bc400} stroke="var(--stroke-0, #2563EB)" />
            </g>
            <defs>
              <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="60.2" id={isVariant2 ? "filter0_di_244_1291" : "filter0_di_244_1252"} width={isVariant2 ? "221.2" : "269.2"} x="0" y="0">
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dy="4" />
                <feGaussianBlur stdDeviation="3.05" />
                <feComposite in2="hardAlpha" operator="out" />
                <feColorMatrix type="matrix" values={isVariant2 ? "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0" : "0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0"} />
                <feBlend in2="BackgroundImageFix" mode="normal" result={isVariant2 ? "effect1_dropShadow_244_1291" : "effect1_dropShadow_244_1252"} />
                <feBlend in="SourceGraphic" in2={isVariant2 ? "effect1_dropShadow_244_1291" : "effect1_dropShadow_244_1252"} mode="normal" result="shape" />
                <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
                <feOffset dx="-3" dy="4" />
                <feGaussianBlur stdDeviation="2.45" />
                <feComposite in2="hardAlpha" k2="-1" k3="1" operator="arithmetic" />
                <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.39 0" />
                <feBlend in2="shape" mode="normal" result={isVariant2 ? "effect2_innerShadow_244_1291" : "effect2_innerShadow_244_1252"} />
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
              <Wrapper>
                <g id="house (2) 1">
                  <path d={svgPaths.p2ab88b80} fill="var(--fill-0, #878E9E)" id="Vector" />
                </g>
              </Wrapper>
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
            <Wrapper>
              <g clipPath={isFavorites ? "url(#clip0_244_1367)" : "url(#clip0_244_1329)"} id="Heart Icon">
                <g id="Frame">
                  <path d={svgPaths.p27070280} fill="var(--fill-0, #878E9E)" id="Vector" />
                </g>
                {isFavorites && <path d={svgPaths.p25a11880} fill="var(--fill-0, white)" id="Vector_2" />}
              </g>
              <defs>
                <clipPath id={isFavorites ? "clip0_244_1367" : "clip0_244_1329"}>
                  <rect fill="white" height="28" width="28" />
                </clipPath>
              </defs>
            </Wrapper>
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
              <Wrapper additionalClassNames="overflow-clip">
                <g id="money (2) 1">
                  <path d={svgPaths.p2683f80} fill="var(--fill-0, #878E9E)" id="Vector" />
                </g>
              </Wrapper>
            )}
            {isDefaultOrActivitySuiteLargeOrUsersLarge && <p className="font-['Inter:Medium',sans-serif] font-medium leading-[28px] not-italic relative shrink-0 text-[#878e9e] text-[20px] whitespace-nowrap">Transactions</p>}
            {isTransactions && (
              <Wrapper>
                <g id="money-fill 1">
                  <path d={svgPaths.p104d0a80} fill="var(--fill-0, white)" id="Vector" />
                </g>
              </Wrapper>
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

export default function Communication() {
  return (
    <div className="bg-[#eef1f9] relative size-full" data-name="Communication">
      <CorportateMenu className="absolute bg-white h-[1317px] left-0 top-0 w-[109px]" property1="Communication" />
      <TopNav className="absolute bg-white h-[80px] right-0 top-0 w-[1811px]" property1="Variant2" />
      <div className="absolute h-[873px] left-[140px] top-[91px] w-[1736px]" data-name="image 25044">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <img alt="" className="absolute h-[120.94%] left-[-1.8%] max-w-none top-[-10.47%] w-[103.22%]" src={imgImage25044} />
        </div>
      </div>
      <div className="absolute bg-white h-[16px] left-[241px] overflow-clip top-[286px] w-[52px]">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[calc(50%-21px)] not-italic text-[#65758c] text-[12px] top-[calc(50%-8px)] whitespace-nowrap">Vendor</p>
      </div>
      <div className="absolute bg-white h-[16px] left-[331px] overflow-clip top-[286px] w-[76px]">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[normal] left-[calc(50%-16px)] not-italic text-[#65758c] text-[12px] top-[calc(50%-8px)] whitespace-nowrap">Team</p>
      </div>
    </div>
  );
}