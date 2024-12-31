import "dotenv/config";
import { insertData } from "./insert.js";
import { format } from "date-fns";

async function getData(cookie, date) {
  const res = await fetch(
    `https://eu.enervu.lg-ess.com/v2/installer/systems/15341/production/energy/total?startDate=${date}&endDate=${date}&todayYn=N&callbackId=2&type=60minutes`,
    {
      headers: {
        accept: "application/json, text/javascript, */*; q=0.01",
        "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
        "content-type": "application/json;charset=UTF-8",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "x-requested-with": "XMLHttpRequest",
        cookie: cookie,
        Referer:
          "https://eu.enervu.lg-ess.com/v2/installer/dashboard.do?page=activatedSystems",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      method: "GET",
    }
  );
  const data = await res.json();
  return data;
}

async function Login(cookieWithJessionId) {
  const res = await fetch(
    "https://eu.enervu.lg-ess.com/v2/account/login.do?lang=de",
    {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        "sec-ch-ua":
          '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"macOS"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        Referer: "https://eu.enervu.lg-ess.com/v2/installer/main.do?lang=de",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      body: process.env.LG_LOGIN_BODY,
      method: "POST",
      redirect: "manual",
    }
  );
  if (res.status === 302) {
    return res.headers.get("set-cookie");
  } else {
    console.log(res.status)
    console.log("Wrong credentials");
  }

  return null;
}

async function parse(date) {
  try {
    const cookie = await Login();
    if (!cookie) {
      throw new Error("Login failed");
    }

    const data = (await getData(cookie, date))["data"]["energyBalance"];
    insertData(data, date);
  } catch (e) {
    console.log("Could not update, try in next interval", e);
  }
}

function getTodayDate() {
  return format(new Date(), "yyyyMMdd");
}

const date = process.argv[2] || getTodayDate();
console.log(process.env.LG_LOGIN_BODY)
parse(date)