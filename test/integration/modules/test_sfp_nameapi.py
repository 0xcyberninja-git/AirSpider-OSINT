import pytest
import unittest

from modules.sfp_nameapi import sfp_nameapi
from sflib import AirSpider
from airspider import AirSpiderEvent, AirSpiderTarget


@pytest.mark.usefixtures
class TestModuleIntegrationNameapi(unittest.TestCase):

    @unittest.skip("todo")
    def test_handleEvent(self):
        sf = AirSpider(self.default_options)

        module = sfp_nameapi()
        module.setup(sf, dict())

        target_value = 'example target value'
        target_type = 'EMAILADDR'
        target = AirSpiderTarget(target_value, target_type)
        module.setTarget(target)

        event_type = 'ROOT'
        event_data = 'example data'
        event_module = ''
        source_event = ''
        evt = AirSpiderEvent(event_type, event_data, event_module, source_event)

        result = module.handleEvent(evt)

        self.assertIsNone(result)
