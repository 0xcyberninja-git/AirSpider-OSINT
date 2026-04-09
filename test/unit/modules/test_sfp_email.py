import pytest
import unittest

from modules.sfp_email import sfp_email
from sflib import AirSpider
from airspider import AirSpiderEvent, AirSpiderTarget


@pytest.mark.usefixtures
class TestModuleEmail(unittest.TestCase):

    def test_opts(self):
        module = sfp_email()
        self.assertEqual(len(module.opts), len(module.optdescs))

    def test_setup(self):
        sf = AirSpider(self.default_options)
        module = sfp_email()
        module.setup(sf, dict())

    def test_watchedEvents_should_return_list(self):
        module = sfp_email()
        self.assertIsInstance(module.watchedEvents(), list)

    def test_producedEvents_should_return_list(self):
        module = sfp_email()
        self.assertIsInstance(module.producedEvents(), list)

    @unittest.skip("todo")
    def test_handleEvent_event_data_target_web_content_containing_email_address_should_return_event(self):
        sf = AirSpider(self.default_options)

        module = sfp_email()
        module.setup(sf, dict())

        target_value = 'airspider.net'
        target_type = 'INTERNET_NAME'
        target = AirSpiderTarget(target_value, target_type)
        module.setTarget(target)

        def new_notifyListeners(self, event):
            expected = 'EMAILADDR'
            if str(event.eventType) != expected:
                raise Exception(f"{event.eventType} != {expected}")

            expected = 'firstname.lastname@airspider.net'
            if str(event.data) != expected:
                raise Exception(f"{event.data} != {expected}")

            raise Exception("OK")

        module.notifyListeners = new_notifyListeners.__get__(module, sfp_email)

        event_type = 'ROOT'
        event_data = 'example data'
        event_module = ''
        source_event = ''
        evt = AirSpiderEvent(event_type, event_data, event_module, source_event)

        event_type = 'TARGET_WEB_CONTENT'
        event_data = '<p>sample data firstname.lastname@airspider.net sample data.</p>'
        event_module = 'example module'
        source_event = evt
        evt = AirSpiderEvent(event_type, event_data, event_module, source_event)

        with self.assertRaises(Exception) as cm:
            module.handleEvent(evt)

        self.assertEqual("OK", str(cm.exception))
