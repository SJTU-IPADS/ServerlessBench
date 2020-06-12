fn --verbose build
fn deploy --create-app --app flow101 --local --verbose
fn config app flow101 COMPLETER_BASE_URL "http://$FLOWSERVER_IP:8081"

