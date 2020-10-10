import time
import json
def main(args):
    """Main."""
    startTime = time.time()
    return { 'sequence':args.get('sequence') + 1,
        'startTime': int(round(startTime * 1000))}