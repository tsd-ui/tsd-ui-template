# Builder image
FROM registry.access.redhat.com/ubi9/nodejs-22:latest AS builder

USER 1001
COPY --chown=1001 . .

RUN \
  npm version && \
  npm config ls && \
  npm clean-install --verbose --ignore-scripts --no-audit && \
  npm run build && \
  npm run dist

# Runner image
FROM registry.access.redhat.com/ubi9/nodejs-22-minimal:latest

USER 0
RUN microdnf -y install tar procps-ng && microdnf clean all

USER 1001

LABEL name="tsd-ui" \
      description="TSD Console - User Interface" \
      license="Apache License 2.0" \
      summary="TSD Console - User Interface"

COPY --from=builder /opt/app-root/src/dist /opt/app-root/dist/

ENV DEBUG=1

WORKDIR /opt/app-root/dist
ENTRYPOINT ["./entrypoint.sh"]
