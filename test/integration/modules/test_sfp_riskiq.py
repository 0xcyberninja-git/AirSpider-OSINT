import pytest
import unittest

from modules.sfp_riskiq import sfp_riskiq
from sflib import AirSpider
from airspider import AirSpiderEvent, AirSpiderTarget


@pytest.mark.usefixtures
class TestModuleIntegrationRiskiq(unittest.TestCase):

    @unittest.skip("todo")
    def test_handleEvent(self):
        sf = AirSpider(self.default_options)

        module = sfp_riskiq()
        module.setup(sf, dict())

        target_value = 'example target value'
        target_type = 'IP_ADDRESS'
        target = AirSpiderTarget(target_value, target_type)
        module.setTarget(target)

        event_type = 'ROOT'
        event_data = 'example data'
        event_module = ''
        source_event = ''
        evt = AirSpiderEvent(event_type, event_data, event_module, source_event)

        result = module.handleEvent(evt)

        self.assertIsNone(result)
