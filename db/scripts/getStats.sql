SELECT (
  (SELECT count("id") FROM public."Users" as users) ,
  (SELECT count("id") FROM public."Projects" as projects) ,
  (SELECT count("id") FROM public."Badges" as badges)
);
