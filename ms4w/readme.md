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

## ogrinfo
* ogrinfo ne_50m_admin_0_countries.shp
* ogrinfo -so ne_50m_admin_0_countries.shp ne_50m_admin_0_countries
* ogrinfo -sql "select distinct continent from ne_50m_admin_0_countries order by continent" ne_50m_admin_0_countries.shp
* ogrinfo -sql "select * from ne_50m_admin_0_countries where NAME = 'France'" ne_50m_admin_0_countries.shp

## ogr2ogr
* ogr2ogr -f "GeoJSON" countries.json ne_50m_admin_0_countries.shp
* ogr2ogr --formats
* ogr2ogr -where "continent = 'Europe'" europe.shp ne_50m_admin_0_countries.shp

## Clipping Shapefiles
* ogr2ogr 
    -f GeoJSON
    counties-clipped.json
    build/cb_2014_us_county_20m.shp
    -clipsrc -124.4096 32.5343 -114.1308 42.0095
## Filtering Shape Files
* ogr2ogr
    -f GeoJSON
    counties-clipped.json
    build/cb_2014_us_county_20m.shp
    -where "STATEFP='O6'"

## Convert GeoJSON to topojson
* topojson -o topo-counties.json counties.json