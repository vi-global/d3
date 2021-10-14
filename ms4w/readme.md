1. download ms4w from https://ms4w.com/
2. gdal will be installed along with it
3. create a folder 'mapserer' under ms4w\apps (C:\ms4w\apps\mapserver)
4. create a conf file 'httpd_mapserver.conf' under httpd.d
    Alias /mapserver/ "/ms4w/apps/mapserver/"

    <Directory "/ms4w/apps/mapserver/">
    AllowOverride None
    Options Indexes FollowSymLinks Multiviews 
    Order allow,deny
    Allow from all
    </Directory>
5. restart apache server
6. download land file from https://www.naturalearthdata.com/downloads/50m-physical-vectors/
                            https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/50m/physical/ne_50m_land.zip
7. download country file from https://www.naturalearthdata.com/downloads/50m-cultural-vectors/
                            https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/50m/cultural/ne_50m_admin_0_countries.zip