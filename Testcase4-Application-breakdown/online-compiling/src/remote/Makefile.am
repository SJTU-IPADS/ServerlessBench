.PHONY: ggfunctions

ggfunctions: $(srcdir)/*.py $(srcdir)/lambda_function/*.py $(srcdir)/common/*.py \
             $(srcdir)/lambda_function/packages.zip \
             $(builddir)/../frontend/gg-execute-static \
             $(TOOLCHAIN_PATH)/*
	$(AM_V_GEN)$(srcdir)/create-function.py --delete --gg-execute-static=$(builddir)/../frontend/gg-execute-static --toolchain-path=$(TOOLCHAIN_PATH) --gg-meow-worker=$(builddir)/../frontend/gg-meow-worker-static

.PHONY: ggfunctions-gcloud

ggfunctions-gcloud: $(srcdir)/*.py $(srcdir)/gcloud_function/*.py $(srcdir)/common/*.py \
             $(srcdir)/gcloud_function/packages.zip \
             $(builddir)/../frontend/gg-execute-static \
             $(TOOLCHAIN_PATH)/*
	$(AM_V_GEN)$(srcdir)/create-gcloud-function.sh --delete --gg-execute-static=$(builddir)/../frontend/gg-execute-static --toolchain-path=$(TOOLCHAIN_PATH) --gg-meow-worker=$(builddir)/../frontend/gg-meow-worker-static

.PHONY: ggfunctions-openwhisk

ggfunctions-openwhisk: $(srcdir)/*.py $(srcdir)/openwhisk_function/*.py $(srcdir)/common/*.py \
             $(builddir)/../frontend/gg-execute-static \
             $(TOOLCHAIN_PATH)/*
	$(AM_V_GEN)$(srcdir)/create-openwhisk-function.py --delete --gg-execute-static=$(builddir)/../frontend/gg-execute-static --toolchain-path=$(TOOLCHAIN_PATH) 
