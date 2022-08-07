const Brand: React.FC<{
  width: string | number;
  height: string | number;
}> = props => (
  <svg
    width={props.width}
    height={props.height}
    viewBox="0 0 300 300"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="300" height="300" rx="50" fill="url(#paint0_linear_96_18)" />
    <path
      d="M94.1701 96.4375V77.5455H206.741V96.4375H161.358V223H139.483V96.4375H94.1701Z"
      fill="white"
    />
    <defs>
      <linearGradient
        id="paint0_linear_96_18"
        x1="0"
        y1="150"
        x2="300"
        y2="150"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.135417" stopColor="#7928CA" />
        <stop offset="1" stopColor="#FF0080" />
      </linearGradient>
    </defs>
  </svg>
);

export default Brand;
