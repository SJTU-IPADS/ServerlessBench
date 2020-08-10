
import time
import io
import json

from fdk import response


def handler(ctx, data: io.BytesIO=None):
    startTime = time.time()
    name = "World"
    try:
        body = json.loads(data.getvalue())
        name = body.get("name")
    except (Exception, ValueError) as ex:
        print(str(ex))

    return response.Response(
        ctx, response_data=json.dumps(
            {"message": "Hello {0}".format(name),
             "startTime": int(round(startTime * 1000))}),
        headers={"Content-Type": "application/json"}
    )
