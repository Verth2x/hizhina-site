FROM uozi/nginx-ui:latest

# Nginx UI seeds /etc/nginx from /usr/local/etc/nginx when its persistent
# volume is empty. Keep the initial proxy sites in that seed so the gateway
# works before anyone signs in to the UI.
#
# Two sites: the public site and the CMS. They are separate files because the
# UI manages them separately, and because each declares its own upstream —
# duplicate upstream names across included files abort nginx startup.
COPY nginx-ui/sites-available/hizhina /usr/local/etc/nginx/sites-available/hizhina
COPY nginx-ui/sites-available/cms     /usr/local/etc/nginx/sites-available/cms
COPY nginx-ui/sites-available/hizhina /etc/nginx/sites-available/hizhina
COPY nginx-ui/sites-available/cms     /etc/nginx/sites-available/cms

RUN ln -sf ../sites-available/hizhina /usr/local/etc/nginx/sites-enabled/hizhina \
 && ln -sf ../sites-available/cms     /usr/local/etc/nginx/sites-enabled/cms \
 && ln -sf ../sites-available/hizhina /etc/nginx/sites-enabled/hizhina \
 && ln -sf ../sites-available/cms     /etc/nginx/sites-enabled/cms
