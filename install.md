#RUTPAM
##Configuration for installation

###Apache conf file
```apache
<VirtualHost *:80>
    #ServerAdmin nestorlora@geeklab.es
    #DocumentRoot "C:/XAMPP/htdocs"
    #
    #
    #
	ProxyPass "/proxy/emt-core/" "http://www.emtmalaga.es/emt-core/"
	ProxyPassReverse "/proxy/emt-core/" "http://www.emtmalaga.es/emt-core/"
    #
</VirtualHost>
```
