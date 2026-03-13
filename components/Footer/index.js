import React from "react";
import Socials from "../Socials";
import Link from "next/link";
import data from "../../data/portfolio.json";

const Footer = ({}) => {
  return (
    <div className="text-center py-8 px-4">
      <p className="text-sm opacity-50 mt-4 font-dm-sans">
        Made With ❤ by {data.name}
      </p>
    </div>
  );
};

export default Footer;
