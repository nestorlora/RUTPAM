#RUTPAM
##Configuration for installation
Para instalar RUTPAM correctamente en el servidor, necesario habilitar un proxy HTTP desde la url "/proxy/emt-core/" hacia los servidores de la EMT de Málaga que atienden la petición en la url "http://www.emtmalaga.es/emt-core/".
Se adjunta un ejemplo de como se realizaría esto en Apache2.
###Apache conf file
```apache
<VirtualHost *:80>
    #
	ProxyPass "/proxy/emt-core/" "http://www.emtmalaga.es/emt-core/"
	ProxyPassReverse "/proxy/emt-core/" "http://www.emtmalaga.es/emt-core/"
    #
</VirtualHost>
```
